<script lang="ts">
	import { goto } from '$app/navigation';
	import { Trash2 } from 'lucide-svelte';

	import { PaneGroup, Pane, PaneResizer } from "paneforge";
	import Button from '$lib/components/Button.svelte';
	import Separator from '$lib/components/Separator.svelte';
	import Article from './Article.svelte';

	import { sessionsStore } from '$lib/store';
	import { ollamaGenerate, type OllamaCompletionResponse } from '$lib/ollama';
	import { saveSession, type Message, type Session, loadSession } from '$lib/sessions';
	import type { PageData } from './$types';
	import { slide } from 'svelte/transition';

	export let data: PageData;

	let messageWindow: HTMLElement;
	let session: Session;
	let completion: string;
	let prompt: string;

	$: session = loadSession(data.id);
	$: isLastMessageFromUser = session.messages[session.messages.length - 1]?.role === 'user';

	function scrollToBottom() {
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
		saveSession({ ...session, context });
	}

	async function handleSubmit() {
		if (!prompt) return;

		const message: Message = { role: 'user', content: prompt };
		prompt = '';
		completion = '';
		session.messages = [...session.messages, message];
		scrollToBottom();

		try {
			const ollama = await ollamaGenerate(session);

			if (ollama && ollama.body) {
				const reader = ollama.body.pipeThrough(new TextDecoderStream()).getReader();

				while (true) {
					const { value, done } = await reader.read();

					if (!ollama.ok && value) throw new Error(JSON.parse(value).error);

					if (done) {
						handleCompletionDone(completion, session.context);
						break;
					}

					scrollToBottom(); // Auto-scroll

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
		} catch (error) {
			handleError(error);
		}
	}

	const _a = `
		underline
		underline-offset-4
		hover:text-neutral-500
	`;
</script>

<div class="flex h-screen w-full flex-col">
	<div class="flex items-center justify-between px-6 py-4">
		<div class="space-y-1">
			<p data-testid="session-id" class="text-sm font-bold leading-none text-foreground">
				Session <a class={_a} href={`/${session.id}`}>#{session.id}</a><br />
			</p>
			<p data-testid="model-name" class="text-sm text-muted-foreground">{session.model}</p>
		</div>
		<Button title="Delete session" variant="outline" size="icon" on:click={deleteSession}>
			<Trash2 class="h-4 w-4" />
		</Button>
	</div>

	<Separator />

	<PaneGroup direction="horizontal" class="bg-accent">
		<Pane defaultSize={60} minSize={30}>
			<div
				class="flex h-full flex-col gap-y-4 overflow-y-auto pt-6 pb-12 px-6 text-current"
				bind:this={messageWindow}
			>
				{#if session.messages.length === 0}
					<div
						class="align-center flex h-full w-full items-center justify-center text-muted-foreground"
						transition:slide
					>
						Write a prompt to start a new session
					</div>
				{/if}

				{#each session.messages as message, i}
					<Article {message} />
				{/each}

				{#if isLastMessageFromUser}
					<Article message={{ role: 'ai', content: completion || '...' }} />
				{/if}
			</div>
		</Pane>
		<PaneResizer class="flex gap-x-1 px-2">
			<Separator orientation="vertical" />
			<Separator orientation="vertical" />
		</PaneResizer>
		<Pane defaultSize={40} minSize={30}>
			<div class="flex h-full flex-col gap-y-6 p-6">
				<textarea
					placeholder="Prompt"
					class="textarea"
					bind:value={prompt}
					on:keydown={handleKeyDown}
				/>
				<Button on:click={handleSubmit} disabled={!prompt}>Send</Button>
			</div>
		</Pane>
	</PaneGroup>
</div>

<style lang="scss">
	.textarea {
		@apply h-full resize-none flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
	}
</style>
