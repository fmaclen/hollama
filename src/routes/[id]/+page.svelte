<script lang="ts">
	import { tick } from 'svelte';
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { StopCircle, Trash2 } from 'lucide-svelte';

	import { PaneGroup, Pane, PaneResizer } from 'paneforge';
	import Button from '$lib/components/Button.svelte';
	import Separator from '$lib/components/Separator.svelte';
	import Article from './Article.svelte';

	import { settingsStore, sessionsStore } from '$lib/store';
	import { ollamaGenerate, type OllamaCompletionResponse } from '$lib/ollama';
	import { saveSession, type Message, type Session, loadSession } from '$lib/sessions';
	import type { PageData } from './$types';
	import FieldModels from '$lib/components/FieldModels.svelte';
	import Field from '$lib/components/Field.svelte';

	export let data: PageData;

	let messageWindow: HTMLElement;
	let session: Session;
	let completion: string;
	let prompt: string;
	let promptCached: string;
	let abortController: AbortController;

	$: session = loadSession(data.id);
	$: isNewSession = !session?.messages.length;
	$: isLastMessageFromUser = session?.messages[session.messages.length - 1]?.role === 'user';
	$: session && scrollToBottom();

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
		goto('/');
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

		const message: Message = { role: 'user', content: prompt };
		promptCached = prompt;
		prompt = '';
		completion = '';
		session.messages = [...session.messages, message];
		abortController = new AbortController();

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

<div class="flex h-screen w-full flex-col">
	<div class="flex items-center justify-between px-6 py-4">
		<div class="space-y-1">
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
	</div>

	<Separator />

	<PaneGroup direction="horizontal" class="bg-accent">
		<Pane defaultSize={40} minSize={30}>
			<div class="flex h-full flex-col p-6">
				{#if isNewSession}
					<div out:slide class="mb-6">
						<FieldModels />
					</div>
				{/if}
				<Field class="mb-6 flex h-full" name="prompt">
					<span slot="title">Prompt</span>
					<textarea
						id="prompt"
						placeholder={$settingsStore?.ollamaModel ? '' : 'No model selected'}
						disabled={!$settingsStore?.ollamaModel}
						class="textarea"
						bind:value={prompt}
						on:keydown={handleKeyDown}
					/>
				</Field>
				<div class="flex w-full">
					<Button class="w-full" on:click={handleSubmit} disabled={!prompt}>Send</Button>
					{#if isLastMessageFromUser}
						<div transition:slide={{ axis: 'x' }} class="ml-2">
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
			<div
				class="flex h-full flex-col overflow-y-auto px-6 pb-12 pt-6 text-current"
				bind:this={messageWindow}
			>
				{#if isNewSession}
					<div
						class="align-center flex h-full w-full items-center justify-center text-muted-foreground"
						transition:slide
					>
						Write a prompt to start a new session
					</div>
				{/if}

				{#each session.messages as message}
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
	.textarea {
		@apply flex h-full min-h-[10em] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
	}
</style>
