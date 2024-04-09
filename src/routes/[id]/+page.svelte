<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';

	import { ollamaGenerate } from '$lib/ollama';
	import { saveSession, type Message, type Session, loadSession } from '$lib/sessions';
	import type { PageData } from './$types';
	import Article from './Article.svelte';

	export let data: PageData;

	let messageWindow: HTMLElement;
	let session: Session;
	let completion: string;
	let prompt: string;

	$: session = loadSession(data.id);

	function scrollToBottom() {
		messageWindow.scrollTop = messageWindow.scrollHeight;
	}

	function handleError(error: any) {
		console.error(error);
		const message: Message = {
			role: 'system',
			content: error ? error : 'Sorry, something went wrong.'
		};
		session.messages = [...session.messages, message];
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
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
						const { response, context } = JSON.parse(line);
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

<div class="h-screen w-full flex flex-col">
	<div class="space-y-1 px-6 py-4">
		<p class="text-sm leading-none">
			Session <a class={_a} href={`/${session.id}`}>#{session.id}</a>
		</p>
		<p class="text-sm text-muted-foreground">{session.model}</p>
	</div>

	<Separator />

	<Resizable.PaneGroup direction="horizontal">
		<Resizable.Pane defaultSize={40} minSize={30}>
			<div class="flex h-full flex-col gap-y-6 bg-gray-100 p-6">
				<Textarea
					placeholder="Prompt"
					class="h-full resize-none"
					bind:value={prompt}
					on:keydown={handleKeyDown}
				/>
				<Button on:click={handleSubmit}>Send</Button>
			</div>
		</Resizable.Pane>
		<Resizable.Handle />
		<Resizable.Pane defaultSize={40} minSize={30}>
			<div
				class="h-full flex flex-col gap-y-4 overflow-y-auto bg-gray-100 p-6 text-neutral-800"
				bind:this={messageWindow}
			>
				{#each session.messages as message, i}
				{@const isFirst = i === 0}
				{@const isLast = i === session.messages.length - 1}
					<Separator class={isFirst ? 'opacity-0' : ''} />
					<Article {message} />
					{#if isLast}<Separator class="opacity-0" />{/if}
				{/each}

				{#if session.messages[session.messages.length - 1]?.role === 'user'}
					<Article message={{ role: 'ai', content: completion || '...' }} />
				{/if}
			</div>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</div>
