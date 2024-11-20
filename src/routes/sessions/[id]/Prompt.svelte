<script lang="ts">
	import { Brain, LoaderCircle, StopCircle, UnfoldVertical } from 'lucide-svelte';
	import MessageSquareText from 'lucide-svelte/icons/message-square-text';
	import Settings_2 from 'lucide-svelte/icons/settings-2';
	import Trash_2 from 'lucide-svelte/icons/trash-2';
	import { toast } from 'svelte-sonner';
	import { writable, type Writable } from 'svelte/store';

	import LL from '$i18n/i18n-svelte';
	import Button from '$lib/components/Button.svelte';
	import ButtonSubmit from '$lib/components/ButtonSubmit.svelte';
	import Field from '$lib/components/Field.svelte';
	import FieldSelectModel from '$lib/components/FieldSelectModel.svelte';
	import FieldTextEditor from '$lib/components/FieldTextEditor.svelte';
	import { ConnectionType } from '$lib/connections';
	import { loadKnowledge, type Knowledge } from '$lib/knowledge';
	import { knowledgeStore, serversStore, settingsStore } from '$lib/localStorage';
	import type { Editor, Message, Session } from '$lib/sessions';
	import { generateStorageId } from '$lib/utils';

	import KnowledgeSelect from './KnowledgeSelect.svelte';

	type KnowledgeAttachment = {
		fieldId: string;
		knowledge?: Knowledge;
	};

	interface Props {
		editor: Writable<Editor>;
		session: Writable<Session>;
		handleSubmit: () => void;
		stopCompletion: () => void;
		scrollToBottom: (shouldForceScroll: boolean) => void;
	}

	let {
		editor = $bindable(),
		session = $bindable(),
		handleSubmit,
		stopCompletion,
		scrollToBottom
	}: Props = $props();

	let chosenModel: string | undefined = $state(undefined);
	let attachments: Writable<KnowledgeAttachment[]> = writable([]);

	const isOllamaFamily = $derived(
		() =>
			$serversStore.find((s) => s.id === $session.model?.serverId)?.connectionType ===
			ConnectionType.Ollama
	);

	$effect(() => {
		$session.model = $settingsStore.models.find((m) => m.name === chosenModel);
	});

	$effect(() => {
		$attachments.length && scrollToBottom(true);
	});

	function toggleCodeEditor() {
		$editor.isCodeEditor = !$editor.isCodeEditor;
		$editor.shouldFocusTextarea = !$editor.isCodeEditor;
	}

	function switchToMessages() {
		$editor.view = 'messages';
		scrollToBottom(true);
	}

	function switchToControls() {
		if (!isOllamaFamily) {
			toast.warning($LL.controlsOnlyAvailableForOllama());
			return;
		}
		$editor.view = 'controls';
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.shiftKey) return;
		if (event.key !== 'Enter') return;
		event.preventDefault();
		submit();
	}

	function handleSelectKnowledge(fieldId: string, knowledgeId: string) {
		$attachments = $attachments.map((a) =>
			a.fieldId === fieldId ? { ...a, knowledge: loadKnowledge(knowledgeId) } : a
		);
	}

	function handleDeleteAttachment(fieldId: string) {
		$attachments = [...$attachments.filter((a) => a.fieldId !== fieldId)];
	}

	function submit() {
		if ($attachments.length) {
			const attachmentMessages: Message[] = [];
			$attachments.forEach((a) => {
				if (a.knowledge)
					attachmentMessages.push({
						role: 'user',
						knowledge: a.knowledge,
						content: `
CONTEXT
---
${a.knowledge.name}
---
${a.knowledge.content}
`
					});
			});
			$session.messages = [...$session.messages, ...attachmentMessages];
			$attachments = [];
		}

		handleSubmit();
	}
</script>

<div class="prompt-editor" class:prompt-editor--fullscreen={$editor.isCodeEditor}>
	<div class="prompt-editor__form">
		<div class="prompt-editor__project">
			<FieldSelectModel isLabelVisible={false} bind:model={chosenModel} />

			<nav class="segmented-nav">
				<div
					class="segmented-nav__button"
					class:segmented-nav__button--active={$editor.view === 'messages'}
				>
					<Button
						aria-label={$LL.messages()}
						variant="icon"
						on:click={switchToMessages}
						class="h-full"
						isActive={$editor.view === 'messages'}
					>
						<MessageSquareText class="base-icon" />
					</Button>
				</div>
				<div
					class="segmented-nav__button"
					class:segmented-nav__button--active={$editor.view === 'controls'}
				>
					<Button
						aria-label={$LL.controls()}
						variant="icon"
						on:click={switchToControls}
						class="h-full"
						isActive={$editor.view === 'controls'}
					>
						<Settings_2 class="base-icon" />
					</Button>
				</div>
			</nav>

			<Button
				variant={$editor.isCodeEditor ? 'default' : 'outline'}
				class="prompt-editor__toggle"
				on:click={toggleCodeEditor}
			>
				<UnfoldVertical class="base-icon" />
			</Button>
		</div>

		{#if $editor.isCodeEditor}
			<FieldTextEditor label={$LL.prompt()} handleSubmit={submit} bind:value={$editor.prompt} />
		{:else}
			<Field name="prompt">
				<textarea
					name="prompt"
					class="prompt-editor__textarea"
					placeholder={$LL.promptPlaceholder()}
					bind:this={$editor.promptTextarea}
					bind:value={$editor.prompt}
					onkeydown={handleKeyDown}
				></textarea>
			</Field>
		{/if}

		{#if $attachments.length}
			<div class="attachments">
				{#each $attachments as attachment (attachment.fieldId)}
					<div class="attachment">
						<div class="attachment__knowledge">
							<KnowledgeSelect
								value={attachment.knowledge?.id}
								options={$knowledgeStore?.filter(
									(k) =>
										// Only filter out knowledge that's selected in OTHER attachments
										!$attachments.find(
											(a) =>
												a.fieldId !== attachment.fieldId && // Skip current attachment
												a.knowledge?.id === k.id
										)
								)}
								showLabel={false}
								fieldId={`attachment-${attachment.fieldId}`}
								onChange={(knowledgeId) =>
									knowledgeId && handleSelectKnowledge(attachment.fieldId, knowledgeId)}
								allowClear={false}
							/>
						</div>
						<Button
							variant="outline"
							on:click={() => handleDeleteAttachment(attachment.fieldId)}
							data-testid="knowledge-attachment-delete"
						>
							<Trash_2 class="base-icon" />
						</Button>
					</div>
				{/each}
			</div>
		{/if}

		<nav class="prompt-editor__toolbar">
			<div class="attachments-toolbar">
				<Button
					variant="outline"
					on:click={() => {
						$attachments = [...$attachments, { fieldId: generateStorageId() }];
					}}
					data-testid="knowledge-attachment"
				>
					<Brain class="base-icon" />
				</Button>
			</div>

			<div class="prompt-editor__submit">
				{#if $editor.messageIndexToEdit !== null}
					<Button
						class="h-full"
						variant="outline"
						on:click={() => {
							$editor.prompt = '';
							$editor.messageIndexToEdit = null;
							$editor.isCodeEditor = false;
						}}
					>
						{$LL.cancel()}
					</Button>
				{/if}

				<ButtonSubmit
					handleSubmit={submit}
					hasMetaKey={$editor.isCodeEditor}
					disabled={!$editor.prompt || !$session.model}
				>
					{$LL.run()}
				</ButtonSubmit>

				{#if $editor.isCompletionInProgress}
					<Button
						class="h-full"
						title={$LL.stopCompletion()}
						variant="outline"
						on:click={stopCompletion}
					>
						<div class="prompt-editor__stop">
							<span class="prompt-editor__stop-icon">
								<StopCircle class=" base-icon" />
							</span>
							<span class="prompt-editor__loading-icon">
								<LoaderCircle class="prompt-editor__loading-icon base-icon animate-spin" />
							</span>
						</div>
					</Button>
				{/if}
			</div>
		</nav>
	</div>
</div>

<style lang="postcss">
	.prompt-editor {
		@apply sticky bottom-0 z-10 mx-auto flex w-full flex-col border-t bg-shade-1 p-3;
		@apply md:p-4;
		@apply lg:p-6;
		@apply 2xl:max-w-[80ch] 2xl:rounded-t-lg 2xl:border-l 2xl:border-r;
	}

	.prompt-editor__project {
		@apply grid grid-cols-[auto,max-content,max-content] items-end gap-x-2;
	}

	:global(.prompt-editor__toggle) {
		@apply h-full;
	}

	.prompt-editor--fullscreen {
		@apply min-h-[60dvh];
		@apply md:min-h-[75dvh];
	}

	.prompt-editor__form {
		@apply overflow-scrollbar flex h-full flex-col gap-y-2;
	}

	.prompt-editor__textarea {
		@apply base-input max-h-48 min-h-14 resize-none scroll-p-2 px-3 py-2;
		field-sizing: content;
		font-variant-ligatures: none;
	}

	.prompt-editor__toolbar {
		@apply flex items-center justify-between gap-x-2;
	}

	.prompt-editor__stop {
		@apply relative -mx-3 -my-2 h-9 w-9;
	}

	.prompt-editor__stop:hover {
		.prompt-editor__stop-icon {
			@apply opacity-100;
		}

		.prompt-editor__loading-icon {
			@apply opacity-0;
		}
	}

	.prompt-editor__submit {
		@apply flex h-full items-center gap-x-2;
	}

	.prompt-editor__stop-icon,
	.prompt-editor__loading-icon {
		@apply absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2;
	}

	.prompt-editor__stop-icon {
		@apply opacity-0;
	}

	.prompt-editor__loading-icon {
		@apply opacity-100;
	}

	.segmented-nav {
		@apply flex h-full items-center rounded bg-shade-2 p-0.5;
	}

	.segmented-nav__button {
		@apply h-full rounded-sm text-shade-6;

		&--active {
			@apply bg-shade-0 text-neutral-50 shadow;
		}
	}

	.attachments-toolbar {
		@apply flex h-full;
	}

	.attachments {
		@apply overflow-scrollbar flex max-h-48 flex-col gap-y-1;
	}

	.attachment {
		@apply flex w-full justify-between;
	}

	.attachment__knowledge {
		@apply w-full;
	}
</style>
