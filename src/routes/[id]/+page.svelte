<script lang="ts">
	import { goto } from '$app/navigation';

	import * as Resizable from '$lib/components/ui/resizable';
	import Button from '$lib/components/ui/button/button.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { Trash2 } from 'lucide-svelte';
	import Article from './Article.svelte';
	
	import { sessionsStore } from '$lib/store';
	import { ollamaGenerate, type OllamaCompletionResponse } from '$lib/ollama';
	import { saveSession, type Message, type Session, loadSession } from '$lib/sessions';
	import type { PageData } from './$types';

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

		let message: Message = { role: 'user', content: prompt };
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
			<p data-testid="session-id" class="text-sm font-bold leading-none">
				Session <a class={_a} href={`/${session.id}`}>#{session.id}</a><br />
			</p>
			<p data-testid="model-name" class="text-sm text-muted-foreground">{session.model}</p>
		</div>
		<Button title="Delete session" variant="outline" size="icon" on:click={deleteSession}>
			<Trash2 class="h-4 w-4" />
		</Button>
	</div>

	<Separator />

	<Resizable.PaneGroup direction="horizontal">
		<Resizable.Pane defaultSize={40} minSize={30}>
			<div class="flex h-full flex-col gap-y-6 bg-accent p-6">
				<Textarea
					placeholder="Prompt"
					class="h-full resize-none"
					bind:value={prompt}
					on:keydown={handleKeyDown}
				/>
				<Button on:click={handleSubmit} disabled={!prompt}>Send</Button>
			</div>
		</Resizable.Pane>
		<Resizable.Handle />
		<Resizable.Pane defaultSize={40} minSize={30}>
			<div
				class="flex h-full flex-col gap-y-4 overflow-y-auto bg-accent p-6 text-current"
				bind:this={messageWindow}
			>
				{#each session.messages as message, i}
					<Article {message} />
				{/each}

				{#if isLastMessageFromUser}
					<Article message={{ role: 'ai', content: completion || '...' }} />
				{/if}
			</div>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</div>
