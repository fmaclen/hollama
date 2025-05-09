<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import { saveSession, type Editor, type Message, type Session } from '$lib/sessions';

	import Article from './Article.svelte';

	interface Props {
		session: Session;
		editor: Editor;
		handleRetry: (index: number) => void;
	}

	let { session = $bindable(), editor = $bindable(), handleRetry }: Props = $props();

	function handleEditMessage(message: Message) {
		editor.messageIndexToEdit = session.messages.findIndex((m) => m === message);
		editor.isCodeEditor = true;
		editor.prompt = message.content;
		editor.attachments = (message.images || []).map((img, idx) => ({
			type: 'image',
			id: `${idx}-${img.filename}`,
			name: img.filename,
			dataUrl: `data:image/png;base64,${img.data}`
		}));
		editor.promptTextarea?.focus();
	}

	function handleDeleteAttachment(message: Message) {
		session.messages = session.messages.filter((m) => m !== message);
		saveSession(session);
	}
</script>

{#if editor.isNewSession}
	<EmptyMessage>{$LL.writePromptToStart()}</EmptyMessage>
{/if}

{#each session.messages as message, i (session.id + i)}
	{#key message.role}
		<Article
			{message}
			retryIndex={['assistant', 'system'].includes(message.role) ? i : undefined}
			{handleRetry}
			handleEditMessage={() => handleEditMessage(message)}
			handleDeleteAttachment={() => handleDeleteAttachment(message)}
		/>
	{/key}
{/each}

{#if editor.isCompletionInProgress}
	<Article
		message={{
			role: 'assistant',
			content: editor.completion || '...',
			reasoning: editor.reasoning
		}}
		isStreamingArticle={true}
		currentRawReasoning={editor.reasoning}
		currentRawCompletion={editor.completion}
	/>
{/if}
