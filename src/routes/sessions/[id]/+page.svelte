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
		generateSessionTitle,
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
	import { createReasoningProcessor } from './reasoningProcessor';

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

	async function handleSubmitNewMessage(images?: { data: string; filename: string }[]) {
		const message: Message = { role: 'user', content: editor.prompt };
		if (images && images.length) message.images = images;
		session.messages = [...session.messages, message];
		
		// Set localized "Untitled session" immediately for first message so it appears in sidebar
		if (session.messages.length === 1 && !session.title) {
			session.title = $LL.untitledSession();
			session.updatedAt = new Date().toISOString();
			saveSession(session);
		}
		
		await scrollToBottom(true); // Force scroll after submitting prompt
		await handleCompletion(session.messages);
	}

	async function handleSubmitEditMessage(images?: { data: string; filename: string }[]) {
		if (editor.messageIndexToEdit === null) return;

		const msg = session.messages[editor.messageIndexToEdit];
		msg.content = editor.prompt;
		if (images) {
			msg.images = images;
		} else {
			delete msg.images;
		}

		// Remove all messages after the edited message
		session.messages = session.messages.slice(0, editor.messageIndexToEdit + 1);

		editor.messageIndexToEdit = null;
		editor.prompt = '';

		await handleCompletion(session.messages);
	}

	function handleSubmit(images?: { data: string; filename: string }[]) {
		if (!editor.prompt) return;
		if (!session.model) return;
		editor.isCodeEditor = false;
		editor.isNewSession = false;
		editor.view = 'messages';

		if (editor.messageIndexToEdit !== null) handleSubmitEditMessage(images);
		else handleSubmitNewMessage(images);
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

		let chatMessages = session.systemPrompt.content
			? [session.systemPrompt, ...messages]
			: messages;

		// Map messages for the chat request, converting images if necessary
		const chatMessagesForRequest = chatMessages.map((msg) => {
			// Ollama expects images as base64 strings without filename
			const images = msg.images?.map((img) => img.data);
			return {
				...msg,
				images // Override images with just the data
			};
		});

		let chatRequest: ChatRequest = {
			model: session.model.name,
			options: session.options,
			messages: chatMessagesForRequest
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

			// Create a reasoning processor to handle tag parsing
			const reasoningProcessor = createReasoningProcessor(
				(text) => {
					editor.completion += text;
				},
				(text) => {
					editor.reasoning += text;
				}
			);

			await strategy.chat(chatRequest, editor.abortController.signal, async (chunk) => {
				// Process the chunk using the FSM-based processor
				reasoningProcessor.processChunk(chunk);
				await scrollToBottom();
			});

			// Finalize processing of any remaining content
			reasoningProcessor.finalize();

			const message: Message = {
				role: 'assistant',
				content: editor.completion,
				reasoning: editor.reasoning
			};

			// Check if we need to generate a title BEFORE adding the message
			const shouldGenerateTitle = session.messages.length === 1 && session.title === $LL.untitledSession();
			
			if (shouldGenerateTitle) {
				console.log('🎯 Session page: Triggering title generation', {
					sessionId: session.id,
					messageCount: session.messages.length + 1, // +1 for the message we're about to add
					currentTitle: session.title
				});
				
				try {
					// Create a temporary session with the new message for title generation
					const tempSession = {
						...session,
						messages: [...session.messages, message]
					};
					
					const generatedTitle = await generateSessionTitle(tempSession, strategy);
					console.log('✅ Session page: Title generated successfully', { generatedTitle });
					
					if (generatedTitle) {
						// Implement typewriter effect
						await animateTitle(generatedTitle);
					} else {
						console.warn('⚠️ Session page: Generated title is empty');
					}
				} catch (error) {
					console.error('❌ Session page: Failed to generate title:', error);
					
					// Fallback to first 56 characters of user's first message
					const firstUserMessage = session.messages.find(
						(m) => m.role === 'user' && m.content && !m.knowledge
					);
					
					if (firstUserMessage?.content) {
						const fallbackTitle = firstUserMessage.content.slice(0, 56);
						console.log('🔧 Session page: Using fallback title from first message', { fallbackTitle });
						await animateTitle(fallbackTitle);
					}
				}
			} else {
				console.log('🔍 Session page: Skipping title generation', {
					messageCount: session.messages.length + 1,
					currentTitle: session.title,
					shouldGenerate: shouldGenerateTitle
				});
			}

			// Now add the message and save everything at once
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

	async function animateTitle(fullTitle: string) {
		console.log('🎬 Session page: Starting typewriter animation', { fullTitle });
		
		// Clear the current title and start building character by character
		session.title = "";
		const chars = fullTitle.split('');
		
		for (const char of chars) {
			session.title += char;
			session.updatedAt = new Date().toISOString();
			saveSession(session);
			
			console.log('⌨️ Session page: Added character', { 
				char, 
				currentTitle: session.title, 
				progress: `${session.title.length}/${fullTitle.length}` 
			});
			
			// Wait 50ms between each character for typewriter effect
			await new Promise(resolve => setTimeout(resolve, 50));
		}
		
		console.log('✅ Session page: Typewriter animation complete', { finalTitle: session.title });
	}
</script>

<div class="session">
	<Head
		title={[editor.isNewSession ? $LL.newSession() : getSessionTitle(session, $LL.untitledSession()), $LL.sessions()]}
	/>
	<Header confirmDeletion={shouldConfirmDeletion}>
		{#snippet headline()}
			<p data-testid="session-id" class="font-bold leading-none">
				{$LL.session()}
				<Button variant="link" href={`/sessions/${session.id}`}>#{session.id}</Button>
			</p>
			<Metadata dataTestid="session-metadata">
				{editor.isNewSession ? $LL.newSession() : formatSessionMetadata(session)}
			</Metadata>
		{/snippet}

		{#snippet nav()}
			{#if !editor.isNewSession}
				{#if !shouldConfirmDeletion}
					<ButtonCopy content={JSON.stringify(session.messages, null, 2)} />
				{/if}
				<ButtonDelete sitemap={Sitemap.SESSIONS} id={session.id} bind:shouldConfirmDeletion />
			{/if}
		{/snippet}
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
