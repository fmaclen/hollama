<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { toast } from 'svelte-sonner';

	import LL from '$i18n/i18n-svelte';
	import { beforeNavigate } from '$app/navigation';
	import { type ChatRequest, type ChatStrategy } from '$lib/chat';
	import { OllamaStrategy } from '$lib/chat/ollama';
	import { OpenAIStrategy } from '$lib/chat/openai';
	import Button from '$lib/components/Button.svelte';
	import ButtonCopy from '$lib/components/ButtonCopy.svelte';
	import ButtonDelete from '$lib/components/ButtonDelete.svelte';
	import Head from '$lib/components/Head.svelte';
	import Header from '$lib/components/Header.svelte';
	import Metadata from '$lib/components/Metadata.svelte';
	import { ConnectionType } from '$lib/connections';
	import { serversStore, settingsStore } from '$lib/localStorage';
	import {
		formatSessionMetadata,
		getSessionTitle,
		loadSession,
		saveSession,
		type Editor,
		type Message
	} from '$lib/sessions';
	import { Sitemap } from '$lib/sitemap';

	import type { PageData } from './$types';
	import Controls from './Controls.svelte';
	import Messages from './Messages.svelte';
	import Prompt from './Prompt.svelte';

	const THOUGHT_TAG = '<thought>';
	const END_THOUGHT_TAG = '</thought>';
	const THINK_TAG = '<think>';
	const END_THINK_TAG = '</think>';
	
	// Tags to consider as reasoning content markers
	const REASONING_TAGS = [
		{ openTag: THOUGHT_TAG, closeTag: END_THOUGHT_TAG },
		{ openTag: THINK_TAG, closeTag: END_THINK_TAG }
	];

	// Type definitions for tag handling
	type TagPair = {
		openTag: string;
		closeTag: string;
	};

	type TagWithPosition = TagPair & {
		index: number;
	};

	type CompleteTagPair = TagPair & {
		openIndex: number;
		closeIndex: number;
	};

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let session = $state(loadSession(data.id));
	let editor = $state<Editor>({
		prompt: '',
		view: 'messages',
		messageIndexToEdit: null,
		isCodeEditor: false,
		isCompletionInProgress: false,
		shouldFocusTextarea: false,
		isNewSession: true
	});
	let messagesWindow: HTMLDivElement | undefined = $state();
	let modelName: string | undefined = $state();
	let userScrolledUp = $state(false);
	let shouldConfirmDeletion = $state(false);

	$effect(() => {
		if (data.id !== session.id) handleSessionChange();
	});

	$effect(() => {
		session.model = $settingsStore.models.find((m) => m.name === modelName);
	});

	$effect(() => {
		if (editor.shouldFocusTextarea && editor.promptTextarea) {
			editor.promptTextarea.focus();
			editor.shouldFocusTextarea = false;
		}
	});

	onMount(async () => {
		handleSessionChange();
		await scrollToBottom();
		messagesWindow?.addEventListener('scroll', handleScroll);
	});

	beforeNavigate((navigation) => {
		if (editor.isCompletionInProgress) {
			const userConfirmed = confirm($LL.areYouSureYouWantToLeave());
			if (userConfirmed) {
				stopCompletion();
				return;
			}
			navigation.cancel();
			return;
		}

		// Only show confirmation when navigating outside of /sessions/ path
		if (
			editor.prompt &&
			editor.prompt.trim() !== '' &&
			!navigation.to?.url.pathname.startsWith('/sessions/')
		) {
			const userConfirmed = confirm($LL.unsavedChangesWillBeLost());
			if (!userConfirmed) {
				navigation.cancel();
			}
		}
	});

	async function handleSessionChange() {
		session = loadSession(data.id);
		modelName = session.model?.name || '';
		editor.view = 'messages';
		editor.isNewSession = !session?.messages?.length;
		scrollToBottom();
	}

	async function handleSubmitNewMessage() {
		const message: Message = { role: 'user', content: editor.prompt };
		session.messages = [...session.messages, message];
		await scrollToBottom(true); // Force scroll after submitting prompt
		await handleCompletion(session.messages);
	}

	async function handleSubmitEditMessage() {
		if (editor.messageIndexToEdit === null) return;

		session.messages[editor.messageIndexToEdit].content = editor.prompt;

		// Remove all messages after the edited message
		session.messages = session.messages.slice(0, editor.messageIndexToEdit + 1);

		editor.messageIndexToEdit = null;
		editor.prompt = '';

		await handleCompletion(session.messages);
	}

	function handleSubmit() {
		if (!editor.prompt) return;
		if (!session.model) return;
		editor.isCodeEditor = false;
		editor.isNewSession = false;
		editor.view = 'messages';

		if (editor.messageIndexToEdit !== null) handleSubmitEditMessage();
		else handleSubmitNewMessage();
	}

	async function handleRetry(index: number) {
		// Remove all the messages after the index
		session.messages = session.messages.slice(0, index);

		const mostRecentUserMessage = session.messages.filter((m) => m.role === 'user').at(-1);
		if (!mostRecentUserMessage) throw new Error('No user message to retry');

		await handleCompletion(session.messages);
	}

	async function handleCompletion(messages: Message[]) {
		editor.abortController = new AbortController();
		editor.isCompletionInProgress = true;
		editor.prompt = '';
		editor.completion = '';
		editor.reasoning = '';

		const server = $serversStore.find((s) => s.id === session.model?.serverId);
		if (!server) throw new Error('Server not found');
		if (!session.model?.name) throw new Error('No model');

		let chatRequest: ChatRequest = {
			model: session.model.name,
			options: session.options,
			messages: session.systemPrompt.content ? [session.systemPrompt, ...messages] : messages
		};

		try {
			let strategy: ChatStrategy | undefined = undefined;
			switch (server.connectionType) {
				case ConnectionType.Ollama:
					strategy = new OllamaStrategy(server);
					break;
				case ConnectionType.OpenAI:
				case ConnectionType.OpenAICompatible:
					strategy = new OpenAIStrategy(server);
					break;
			}

			if (!strategy) throw new Error('Invalid strategy');

			let isInReasoningTag = false;
			let bufferChunk = '';
			let currentTagPair: TagPair | null = null;
			
			/**
			 * Helper function to find first opening and closing tags in buffer
			 * Returns an object with opening/closing tags and their positions, or null if none found
			 */
			function findTags(buffer: string): CompleteTagPair | null {
				let result = null;
				
				for (const tagPair of REASONING_TAGS) {
					const openIndex = buffer.indexOf(tagPair.openTag);
					const closeIndex = buffer.indexOf(tagPair.closeTag);
					
					// Check if both tags exist and are properly ordered
					if (openIndex !== -1 && closeIndex !== -1 && openIndex < closeIndex) {
						// If we don't have a result yet, or this pair starts earlier, use this one
						if (result === null || openIndex < result.openIndex) {
							result = {
								...tagPair,
								openIndex,
								closeIndex
							};
						}
					}
				}
				
				return result;
			}
			
			/**
			 * Helper function to find the first opening tag in buffer
			 * Returns tag data or null if none found
			 */
			function findFirstOpeningTag(buffer: string): TagWithPosition | null {
				let firstTag = null;
				let firstIndex = Infinity;
				
				for (const tagPair of REASONING_TAGS) {
					const index = buffer.indexOf(tagPair.openTag);
					if (index !== -1 && index < firstIndex) {
						firstIndex = index;
						firstTag = { ...tagPair, index };
					}
				}
				
				return firstIndex < Infinity ? firstTag : null;
			}
			
			/**
			 * Helper function to find the first closing tag in buffer
			 */
			function findFirstClosingTag(buffer: string): TagWithPosition | null {
				let firstTag = null;
				let firstIndex = Infinity;
				
				// If we know the current tag pair, prioritize its closing tag
				if (currentTagPair) {
					const index = buffer.indexOf(currentTagPair.closeTag);
					if (index !== -1) {
						return { ...currentTagPair, index };
					}
				}
				
				// Otherwise check all possible closing tags
				for (const tagPair of REASONING_TAGS) {
					const index = buffer.indexOf(tagPair.closeTag);
					if (index !== -1 && index < firstIndex) {
						firstIndex = index;
						firstTag = { ...tagPair, index };
					}
				}
				
				return firstIndex < Infinity ? firstTag : null;
			}
			
			await strategy.chat(chatRequest, editor.abortController.signal, async (chunk) => {
				// Add the current chunk to our buffer for processing
				bufferChunk += chunk;
				
				// Process the buffer repeatedly until we've handled all tags
				let continueProcessing = true;
				
				while (continueProcessing) {
					// Default to stopping after this iteration unless we find more to process
					continueProcessing = false;
					
					// Case 1: Complete thought block (has both opening and closing tags)
					const completePair = findTags(bufferChunk);
					if (completePair) {
						const start = completePair.openIndex + completePair.openTag.length;
						const end = completePair.closeIndex;
						
						// Extract the content between tags as reasoning
						editor.reasoning += bufferChunk.slice(start, end);
						
						// Add content before the opening tag to completion if needed
						if (completePair.openIndex > 0) {
							editor.completion += bufferChunk.slice(0, completePair.openIndex);
						}
						
						// Keep content after the end tag for further processing
						bufferChunk = bufferChunk.slice(end + completePair.closeTag.length);
						
						// Continue processing if there's content left
						if (bufferChunk.length > 0) {
							continueProcessing = true;
						}
					}
					// Case 2: Only opening tag found
					else {
						const openingTag = findFirstOpeningTag(bufferChunk);
						if (openingTag) {
							isInReasoningTag = true;
							currentTagPair = openingTag;
							
							// Add content before the tag to completion
							if (openingTag.index > 0) {
								editor.completion += bufferChunk.slice(0, openingTag.index);
							}
							
							// Remove content up to and including the opening tag
							bufferChunk = bufferChunk.slice(openingTag.index + openingTag.openTag.length);
							
							// We'll accumulate the reasoning in the next iteration or when end tag is found
							continueProcessing = false; // Stop and wait for more chunks
						}
						// Case 3: Only closing tag found
						else {
							const closingTag = findFirstClosingTag(bufferChunk);
							if (closingTag) {
								// Add content before the tag to reasoning or completion based on current state
								if (isInReasoningTag) {
									editor.reasoning += bufferChunk.slice(0, closingTag.index);
								} else {
									editor.completion += bufferChunk.slice(0, closingTag.index);
								}
								
								isInReasoningTag = false;
								currentTagPair = null;
								
								// Remove content up to and including the closing tag
								bufferChunk = bufferChunk.slice(closingTag.index + closingTag.closeTag.length);
								
								// Continue processing any remaining content
								if (bufferChunk.length > 0) {
									continueProcessing = true;
								}
							}
							// Case 4: No tags found, process based on current state
							else {
								// If buffer is getting too large, process part of it
								if (bufferChunk.length > 1000) {
									// Process half the buffer to avoid losing context
									const halfLength = Math.floor(bufferChunk.length / 2);
									
									if (isInReasoningTag) {
										editor.reasoning += bufferChunk.slice(0, halfLength);
									} else {
										editor.completion += bufferChunk.slice(0, halfLength);
									}
									
									// Keep the rest for further processing
									bufferChunk = bufferChunk.slice(halfLength);
								}
								
								// No more processing needed for now
								continueProcessing = false;
							}
						}
					}
				}
				
				await scrollToBottom();
			});
			
			// Process any remaining buffer content at the end
			if (bufferChunk.length > 0) {
				if (isInReasoningTag) {
					editor.reasoning += bufferChunk;
				} else {
					editor.completion += bufferChunk;
				}
			}

			const message: Message = {
				role: 'assistant',
				content: editor.completion,
				reasoning: editor.reasoning
			};
			
			session.messages = [...session.messages, message];
			session.updatedAt = new Date().toISOString();
			saveSession(session);

			editor.completion = '';
			editor.reasoning = '';
			editor.shouldFocusTextarea = true;
			editor.isCompletionInProgress = false;
			await scrollToBottom();
		} catch (error) {
			const typedError = error instanceof Error ? error : new Error(String(error));
			if (typedError.name === 'AbortError') return; // User aborted the request
			handleError(typedError);
		}
	}

	function stopCompletion() {
		editor.prompt = session.messages[session.messages.length - 1].content; // Reset the prompt to the last sent message
		editor.abortController?.abort();
		editor.completion = '';
		editor.isCompletionInProgress = false;
		session.messages = session.messages.slice(0, -1); // Remove the "incomplete" AI response
		editor.isNewSession = !session.messages.length;
	}

	function handleError(error: Error) {
		if (error.message === 'Failed to fetch') {
			toast.error($LL.genericError(), { description: $LL.cantConnectToOllamaServer() });
		} else {
			toast.error($LL.genericError(), { description: error.toString() });
		}
		stopCompletion();
	}

	function handleScroll() {
		if (!messagesWindow) return;
		const { scrollTop, scrollHeight, clientHeight } = messagesWindow;
		userScrolledUp = scrollTop + clientHeight < scrollHeight;
	}

	async function scrollToBottom(shouldForceScroll = false) {
		if (!shouldForceScroll && (!messagesWindow || userScrolledUp)) return;
		await tick();
		requestAnimationFrame(() => {
			if (messagesWindow) messagesWindow.scrollTop = messagesWindow.scrollHeight;
		});
	}
</script>

<div class="session">
	<Head
		title={[editor.isNewSession ? $LL.newSession() : getSessionTitle(session), $LL.sessions()]}
	/>
	<Header confirmDeletion={shouldConfirmDeletion}>
		<p data-testid="session-id" class="font-bold leading-none">
			{$LL.session()}
			<Button variant="link" href={`/sessions/${session.id}`}>#{session.id}</Button>
		</p>
		<Metadata dataTestid="session-metadata">
			{editor.isNewSession ? $LL.newSession() : formatSessionMetadata(session)}
		</Metadata>

		<svelte:fragment slot="nav">
			{#if !editor.isNewSession}
				{#if !shouldConfirmDeletion}
					<ButtonCopy content={JSON.stringify(session.messages, null, 2)} />
				{/if}
				<ButtonDelete sitemap={Sitemap.SESSIONS} id={session.id} bind:shouldConfirmDeletion />
			{/if}
		</svelte:fragment>
	</Header>

	{#if editor.view === 'controls'}
		<Controls bind:session />
	{:else}
		<div class="session__history" bind:this={messagesWindow}>
			<Messages bind:session bind:editor {handleRetry} />
		</div>
	{/if}

	<Prompt
		bind:session
		bind:editor
		bind:modelName
		{handleSubmit}
		{stopCompletion}
		{scrollToBottom}
	/>
</div>

<style lang="postcss">
	.session {
		@apply flex h-full w-full flex-col overflow-hidden;
	}

	.session__history {
		@apply base-fieldset-container overflow-scrollbar flex-grow;
	}
</style>
