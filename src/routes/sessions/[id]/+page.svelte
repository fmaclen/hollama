<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { PaneGroup, Pane, PaneResizer } from 'paneforge';
	import { FilePlus, StopCircle, Trash2 } from 'lucide-svelte';

	import Button from '$lib/components/Button.svelte';
	import Separator from '$lib/components/Separator.svelte';
	import Article from './Article.svelte';
	import FieldSelectModel from '$lib/components/FieldSelectModel.svelte';
	import Field from '$lib/components/Field.svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import FieldSelect from '$lib/components/FieldSelect.svelte';
	import Header from '$lib/components/Header.svelte';

	import { loadKnowledge, type Knowledge } from '$lib/knowledge';
	import { settingsStore, sessionsStore, knowledgeStore } from '$lib/store';
	import { ollamaGenerate, type OllamaCompletionResponse } from '$lib/ollama';
	import { saveSession, type Message, type Session, loadSession } from '$lib/sessions';
	import { generateNewUrl } from '$lib/components/ButtonNew';
	import { Sitemap } from '$lib/sitemap';

	import type { PageData } from './$types';
	import FieldTextEditor from '$lib/components/FieldTextEditor.svelte';

	export let data: PageData;

	let messageWindow: HTMLElement;
	let session: Session;
	let completion: string;
	let prompt: string;
	let promptCached: string;
	let abortController: AbortController;

	let knowledgeId: string;
	let knowledge: Knowledge | null;

	$: session = loadSession(data.id);
	$: isNewSession = !session?.messages.length;
	$: isLastMessageFromUser = session?.messages[session.messages.length - 1]?.role === 'user';
	$: session && scrollToBottom();
	$: if ($settingsStore?.ollamaModel) session.model = $settingsStore.ollamaModel;
	$: knowledge = knowledgeId ? loadKnowledge(knowledgeId) : null;

	async function scrollToBottom() {
		if (!messageWindow) return;
		await tick();
		messageWindow.scrollTop = messageWindow.scrollHeight;
	}

	function handleError(error: any) {
		const message: Message = {
			role: 'system',
			content: typeof error === 'string' ? error : 'Sorry, something went wrong.'
		};
		session.messages = [...session.messages, message];
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}

	function deleteSession() {
		const confirmed = confirm('Are you sure you want to delete this session?');
		if (!confirmed) return;

		if ($sessionsStore) {
			const updatedSessions = $sessionsStore.filter((s) => s.id !== session.id);
			$sessionsStore = updatedSessions;
		}
		goto('/sessions');
	}

	async function handleCompletionDone(completion: string, context: number[]) {
		const message: Message = { role: 'ai', content: completion };
		session.messages = [...session.messages, message];
		completion = '';
		promptCached = '';
		saveSession({ ...session, context });
	}

	async function handleSubmit() {
		if (!prompt) return;

		let knowledgeContext: Message | null = null;
		if (knowledge) {
			knowledgeContext = {
				role: 'system',
				knowledge,
				content: ''
			};

			// Now that we used the knowledge, we no longer need an `id`
			// This will prevent `knowledge` from being used again
			knowledgeId = '';
		}

		const message: Message = { role: 'user', content: prompt };
		abortController = new AbortController();
		promptCached = prompt;
		prompt = '';
		completion = '';
		session.messages = knowledgeContext
			? [knowledgeContext, ...session.messages, message]
			: [...session.messages, message];

		try {
			const ollama = await ollamaGenerate(session, abortController.signal);

			if (ollama && ollama.body) {
				const reader = ollama.body.pipeThrough(new TextDecoderStream()).getReader();

				while (true) {
					const { value, done } = await reader.read();

					if (!ollama.ok && value) throw new Error(JSON.parse(value).error);

					if (done) {
						handleCompletionDone(completion, session.context);
						break;
					}

					if (!value) continue;

					const jsonLines = value.split('\n').filter((line) => line);
					for (const line of jsonLines) {
						const { response, context } = JSON.parse(line) as OllamaCompletionResponse;
						completion += response;
						session.context = context;
					}
				}
			} else {
				throw new Error("Couldn't connect to Ollama");
			}
		} catch (error: any) {
			if (error.name === 'AbortError') return; // User aborted the request
			handleError(error);
		}
	}

	function handleAbort() {
		abortController.abort();
		// Reset the prompt to the last sent message
		prompt = promptCached;
		promptCached = '';
		// Remove the "incomplete" AI response
		session.messages = session.messages.slice(0, -1);
	}
</script>

<div class="session">
	<Header>
		<div class="space-y-4">
			<p data-testid="session-id" class="text-sm font-bold leading-none text-foreground">
				Session <Button size="link" variant="link" href={`/${session.id}`}>#{session.id}</Button>
			</p>
			<p data-testid="model-name" class="text-sm text-muted-foreground">
				{isNewSession ? 'New session' : session.model}
			</p>
		</div>
		<Button title="Delete session" variant="outline" size="icon" on:click={deleteSession}>
			<Trash2 class="h-4 w-4" />
		</Button>
	</Header>

	<Separator />

	<PaneGroup direction="horizontal">
		<Pane defaultSize={40} minSize={30}>
			<div class="flex h-full flex-col gap-y-6 p-6">
				{#if isNewSession}
					<FieldSelectModel />
					<div class="grid grid-cols-[auto,max-content] items-end gap-x-2">
						<FieldSelect
							label="Knowledge"
							name="knowledge"
							disabled={!$knowledgeStore}
							options={$knowledgeStore?.map((k) => ({ value: k.id, option: k.name }))}
							bind:value={knowledgeId}
						/>

						<Button
							aria-label="New knowledge"
							variant="outline"
							size="icon"
							href={generateNewUrl(Sitemap.KNOWLEDGE)}
						>
							<FilePlus class="h-4 w-4" />
						</Button>
					</div>
				{/if}

				<Field class="h-full" name="prompt">
					<svelte:fragment slot="label">Prompt</svelte:fragment>
					{#key prompt}
						<FieldTextEditor bind:value={prompt} />
					{/key}
				</Field>

				<div class="flex w-full">
					<Button class="w-full" on:click={handleSubmit} disabled={!prompt}>Send</Button>
					{#if isLastMessageFromUser}
						<div class="ml-2">
							<Button title="Stop response" variant="outline" size="icon" on:click={handleAbort}>
								<StopCircle class="h-4 w-4" />
							</Button>
						</div>
					{/if}
				</div>
			</div>
		</Pane>

		<PaneResizer class="flex gap-x-1 px-2">
			<Separator orientation="vertical" />
			<Separator orientation="vertical" />
		</PaneResizer>

		<Pane defaultSize={60} minSize={30}>
			<div class="article-list" bind:this={messageWindow}>
				{#if isNewSession}
					<EmptyMessage>Write a prompt to start a new session</EmptyMessage>
				{/if}

				{#each session.messages as message, i (session.id + i)}
					<Article {message} />
				{/each}

				{#if isLastMessageFromUser}
					<Article message={{ role: 'ai', content: completion || '...' }} />
				{/if}
			</div>
		</Pane>
	</PaneGroup>
</div>

<style lang="scss">
	.session {
		@apply flex h-full w-full flex-col overflow-y-auto;
	}

	.article-list {
		@apply flex h-full flex-col overflow-y-auto px-6 pb-12 pt-6 text-current outline outline-green-500;
	}
</style>
