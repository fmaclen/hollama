<script lang="ts">
	import { ollamaGenerate } from '$lib/ollama';
	import { saveSession, type Message, type Session, loadSession } from '$lib/sessions';
	import type { PageData } from './$types';

	export let data: PageData;

	let messageWindow: HTMLElement;
	let session: Session;
	let completion: string;
	let prompt: string;
	let isSpeaking: boolean = false;

	$: session = loadSession(data.id);

	function scrollToBottom() {
		messageWindow.scrollTop = messageWindow.scrollHeight;
	}

	function speak() {
		if (isSpeaking) {
			speechSynthesis.cancel();
			isSpeaking = false;
			return;
		}

		const message = session.messages[session.messages.length - 1].content;
		const utterance = new SpeechSynthesisUtterance(message);
		utterance.rate = 0.8;
		if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
			const voices = speechSynthesis.getVoices();
			utterance.voice = voices.find((voice) => voice.name === 'Samantha') || voices[0];
		}
		speechSynthesis.speak(utterance);
		isSpeaking = true;
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
</script>

<div class="chat">
	<header class="chat__header">
		<a href="/" title="Main menu">
			<img class="chat__logo" src="/favicon.png" alt="Ollama" width="48" height="48" />
		</a>
		<div class="chat__model">
			<p class="chat__model-name">Session: <a href={`/${session.id}`}>{session.id}</a></p>
			<p class="chat__model-label">Model: {session.model}</p>
		</div>

		<nav class="chat__modes">
			<!-- <button title="Keyboard" class="chat__modes-button chat__modes-button--active">⌨️</button> -->
			<button
				title="Voice"
				class="chat__modes-button {isSpeaking && 'chat__modes-button--is-speaking'}"
				on:click={speak}>🎧</button
			>
		</nav>
	</header>

	<main class="chat__messages" bind:this={messageWindow}>
		{#each session.messages as message}
			<article class="chat__article">
				<p class="chat__role chat__role--{message.role}">{message.role}</p>
				<p class="chat__message">{message.content}</p>
			</article>
		{/each}

		{#if session.messages[session.messages.length - 1]?.role === 'user'}
			<article class="chat__article">
				<p class="chat__role chat__role--ai">AI</p>
				{#if completion}
					{@html completion}
				{:else}
					<p class="chat__message">...</p>
				{/if}
			</article>
		{/if}
	</main>

	<footer class="chat__footer">
		<div class="chat__type">
			<textarea
				class="chat__textarea"
				placeholder="Type your message here"
				bind:value={prompt}
				on:keydown={handleKeyDown}
			/>
			<button on:click={handleSubmit}>Send</button>
		</div>
	</footer>
</div>

<style lang="scss">
	.chat {
		--color-border: rgba(0, 0, 0, 0.1);
		--color-active: #007aff;

		display: grid;
		width: 100%;
		height: 100dvh;
		grid-template-rows: max-content auto max-content;

		&__header,
		&__messages {
			padding-block: 16px;
			padding-inline: 24px;
			background-color: var(--color-background);
		}

		&__header {
			display: flex;
			gap: 16px;
			align-items: center;
			border-bottom: 1px solid var(--color-border);
			position: sticky;
			top: 0;
		}

		&__logo {
			display: block;
		}

		&__modes {
			display: flex;
			gap: 8px;
			margin-left: auto;
		}

		&__modes-button {
			border: 1px solid var(--color-border);
			background-color: unset;
			padding: 6px;
			font-size: 18px;

			&--is-speaking {
				background-color: var(--color-active);
			}
		}

		&__messages {
			overflow-y: auto;
		}

		&__article {
			margin-block: 24px;
			display: grid;
			grid-template-columns: 72px auto;
		}

		&__role {
			font-weight: 600;
			margin-block: unset;
			text-transform: uppercase;
			font-size: 12px;
			letter-spacing: 1px;
			line-height: 20px;

			&--user {
				color: rgba(0, 0, 0, 0.33);
			}
		}

		&__message {
			margin-block: unset;
			white-space: pre-wrap;
		}

		&__model {
			display: flex;
			flex-direction: column;
			gap: 4px;
		}

		&__model-label,
		&__model-name {
			font-size: 12px;
			margin-block: unset;
		}

		&__model-label {
			color: rgba(0, 0, 0, 0.33);
		}

		&__model-name {
			font-weight: 600;

			a {
				color: unset;
			}
		}

		&__footer {
			position: sticky;
			bottom: 0;
			display: flex;
			gap: 16px;
			border-top: 1px solid var(--color-border);
			background-color: white;
		}

		&__type {
			display: flex;
			width: 100%;
			gap: 16px;

			textarea,
			button {
				padding-block: 24px;
				padding-inline: 24px;
				font-size: 16px;
				border: unset;
				font-family: var(--font-family);
			}

			textarea {
				display: block;
				width: 100%;
				min-height: 96px;
				padding-right: unset;
				outline: none;
			}

			button {
				background-color: unset;
				padding-left: unset;
				font-weight: 600;
				align-self: flex-start;
				cursor: pointer;
				color: var(--color-active);
			}
		}
	}
</style>
