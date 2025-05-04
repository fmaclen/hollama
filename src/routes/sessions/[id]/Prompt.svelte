<script lang="ts">
	import { Brain, Image, LoaderCircle, StopCircle, UnfoldVertical } from 'lucide-svelte';
	import MessageSquareText from 'lucide-svelte/icons/message-square-text';
	import Settings_2 from 'lucide-svelte/icons/settings-2';
	import Trash_2 from 'lucide-svelte/icons/trash-2';
	import { toast } from 'svelte-sonner';

	import LL from '$i18n/i18n-svelte';
	import Button from '$lib/components/Button.svelte';
	import ButtonSubmit from '$lib/components/ButtonSubmit.svelte';
	import Field from '$lib/components/Field.svelte';
	import FieldSelectModel from '$lib/components/FieldSelectModel.svelte';
	import FieldTextEditor from '$lib/components/FieldTextEditor.svelte';
	import { ConnectionType } from '$lib/connections';
	import { loadKnowledge, type Knowledge } from '$lib/knowledge';
	import { knowledgeStore, serversStore } from '$lib/localStorage';
	import type { Editor, Message, Session } from '$lib/sessions';
	import { generateRandomId } from '$lib/utils';

	import KnowledgeSelect from './KnowledgeSelect.svelte';

	type KnowledgeAttachment = {
		type: 'knowledge';
		fieldId: string;
		knowledge?: Knowledge;
	};

	type ImageAttachment = {
		type: 'image';
		id: string;
		name: string;
		dataUrl: string;
	};

	type Attachment = KnowledgeAttachment | ImageAttachment;

	interface Props {
		editor: Editor;
		session: Session;
		modelName: string | undefined;
		handleSubmit: (images?: string[]) => void;
		stopCompletion: () => void;
		scrollToBottom: (shouldForceScroll: boolean) => void;
	}

	let {
		editor = $bindable(),
		session = $bindable(),
		modelName = $bindable(),
		handleSubmit,
		stopCompletion,
		scrollToBottom
	}: Props = $props();

	let attachments: Attachment[] = $state([]);

	const isOllamaFamily = $derived(
		$serversStore.find((s) => s.id === session.model?.serverId)?.connectionType ===
			ConnectionType.Ollama
	);

	$effect(() => {
		attachments.length && scrollToBottom(true);
	});

	function toggleCodeEditor() {
		editor.isCodeEditor = !editor.isCodeEditor;
		editor.shouldFocusTextarea = !editor.isCodeEditor;
	}

	function switchToMessages() {
		editor.view = 'messages';
		scrollToBottom(true);
	}

	function switchToControls() {
		if (!isOllamaFamily) {
			toast.warning($LL.controlsOnlyAvailableForOllama());
			return;
		}
		editor.view = 'controls';
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.shiftKey) return;
		if (event.key !== 'Enter') return;
		event.preventDefault();
		submit();
	}

	function handleSelectKnowledge(fieldId: string, knowledgeId: string) {
		attachments = attachments.map((a) =>
			a.type === 'knowledge' && a.fieldId === fieldId
				? { ...a, knowledge: loadKnowledge(knowledgeId) }
				: a
		);
	}

	function handleImageUploadClick() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = (event) => {
				const dataUrl = event.target?.result as string;
				if (dataUrl) {
					attachments = [
						...attachments,
						{
							type: 'image',
							id: generateRandomId(),
							name: file.name,
							dataUrl
						}
					];
				}
			};
			reader.readAsDataURL(file);
		};
		input.click();
	}

	function handleDeleteAttachment(id: string) {
		attachments = [
			...attachments.filter((a) => (a.type === 'knowledge' ? a.fieldId : a.id) !== id)
		];
	}

	function submit() {
		const knowledgeAttachments = attachments.filter(
			(a): a is KnowledgeAttachment => a.type === 'knowledge'
		);
		if (knowledgeAttachments.length) {
			const knowledgeAttachmentMessages: Message[] = [];
			attachments.forEach((a) => {
				if (a.type === 'knowledge' && a.knowledge)
					knowledgeAttachmentMessages.push({
						role: 'user',
						knowledge: a.knowledge,
						content: `
<CONTEXT>
	<CONTEXT_NAME>${a.knowledge.name}</CONTEXT_NAME>
	<CONTEXT_CONTENT>${a.knowledge.content}</CONTEXT_CONTENT>
</CONTEXT>
`
					});
			});
			session.messages = [...session.messages, ...knowledgeAttachmentMessages];
			attachments = attachments.filter((a) => a.type !== 'knowledge');
		}

		const imageAttachments = attachments.filter((a): a is ImageAttachment => a.type === 'image');
		const images = imageAttachments.map((a) =>
			a.dataUrl.replace(/^data:image\/[a-zA-Z]+;base64,/, '')
		);

		handleSubmit(images.length ? images : undefined);
		attachments = [];
	}
</script>

<div class="prompt-editor" class:prompt-editor--fullscreen={editor.isCodeEditor}>
	<div class="prompt-editor__form">
		<div class="prompt-editor__project">
			<FieldSelectModel isLabelVisible={false} bind:value={modelName} />

			<nav class="segmented-nav">
				<div
					class="segmented-nav__button"
					class:segmented-nav__button--active={editor.view === 'messages'}
				>
					<Button
						aria-label={$LL.messages()}
						variant="icon"
						on:click={switchToMessages}
						class="h-full"
						isActive={editor.view === 'messages'}
					>
						<MessageSquareText class="base-icon" />
					</Button>
				</div>
				<div
					class="segmented-nav__button"
					class:segmented-nav__button--active={editor.view === 'controls'}
				>
					<Button
						aria-label={$LL.controls()}
						variant="icon"
						on:click={switchToControls}
						class="h-full"
						isActive={editor.view === 'controls'}
					>
						<Settings_2 class="base-icon" />
					</Button>
				</div>
			</nav>

			<Button
				variant={editor.isCodeEditor ? 'default' : 'outline'}
				class="prompt-editor__toggle"
				on:click={toggleCodeEditor}
			>
				<UnfoldVertical class="base-icon" />
			</Button>
		</div>

		{#if editor.isCodeEditor}
			<FieldTextEditor label={$LL.prompt()} handleSubmit={submit} bind:value={editor.prompt} />
		{:else}
			<Field name="prompt">
				<textarea
					name="prompt"
					class="prompt-editor__textarea"
					placeholder={$LL.promptPlaceholder()}
					bind:this={editor.promptTextarea}
					bind:value={editor.prompt}
					onkeydown={handleKeyDown}
				></textarea>
			</Field>
		{/if}

		{#if attachments.length}
			<div class="attachments">
				{#each attachments as attachment (attachment.type === 'knowledge' ? attachment.fieldId : attachment.id)}
					<div class="attachment">
						{#if attachment.type === 'knowledge'}
							<div class="attachment__knowledge">
								<KnowledgeSelect
									value={attachment.knowledge?.id}
									options={$knowledgeStore?.filter(
										(k) =>
											// Only filter out knowledge that's selected in OTHER attachments
											!attachments.find((a) => {
												if (a.type !== 'knowledge' || attachment.type !== 'knowledge') return false;
												return a.fieldId !== attachment.fieldId && a.knowledge?.id === k.id;
											})
									)}
									showLabel={false}
									fieldId={`attachment-${attachment.fieldId}`}
									onChange={(knowledgeId) =>
										knowledgeId && handleSelectKnowledge(attachment.fieldId, knowledgeId)}
									allowClear={false}
								/>
							</div>
						{:else}
							<div class="attachment__image">
								<img
									src={attachment.dataUrl}
									alt={attachment.name}
									class="attachment__image-preview"
								/>
								<span class="attachment__image-name">{attachment.name}</span>
							</div>
						{/if}
						<Button
							variant="outline"
							on:click={() =>
								handleDeleteAttachment(
									attachment.type === 'knowledge' ? attachment.fieldId : attachment.id
								)}
							data-testid="attachment-delete"
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
						attachments = [...attachments, { type: 'knowledge', fieldId: generateRandomId() }];
					}}
					data-testid="knowledge-attachment"
				>
					<Brain class="base-icon" />
				</Button>
				<Button
					variant="outline"
					on:click={handleImageUploadClick}
					data-testid="image-attachment"
					title={'Attach image'}
				>
					<Image class="base-icon" />
				</Button>
			</div>

			<div class="prompt-editor__submit">
				{#if editor.messageIndexToEdit !== null}
					<Button
						class="h-full"
						variant="outline"
						on:click={() => {
							editor.prompt = '';
							editor.messageIndexToEdit = null;
							editor.isCodeEditor = false;
						}}
					>
						{$LL.cancel()}
					</Button>
				{/if}

				<ButtonSubmit
					handleSubmit={submit}
					hasMetaKey={editor.isCodeEditor}
					disabled={!editor.prompt || !session.model || editor.isCompletionInProgress}
				>
					{$LL.run()}
				</ButtonSubmit>

				{#if editor.isCompletionInProgress}
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
		@apply flex h-full gap-x-1;
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

	.attachment__image {
		@apply mr-2 flex w-full items-center gap-x-2 overflow-hidden text-ellipsis whitespace-nowrap rounded-md border p-1;
	}

	.attachment__image-preview {
		@apply h-8 w-8 rounded-sm object-cover;
	}

	.attachment__image-name {
		@apply text-xs;
	}
</style>
