<script lang="ts">
	import { LoaderCircle, StopCircle, UnfoldVertical } from 'lucide-svelte';
	import MessageSquareText from 'lucide-svelte/icons/message-square-text';
	import Settings_2 from 'lucide-svelte/icons/settings-2';
	import type { Writable } from 'svelte/store';

	import LL from '$i18n/i18n-svelte';
	import Button from '$lib/components/Button.svelte';
	import ButtonSubmit from '$lib/components/ButtonSubmit.svelte';
	import Field from '$lib/components/Field.svelte';
	import FieldSelectModel from '$lib/components/FieldSelectModel.svelte';
	import FieldTextEditor from '$lib/components/FieldTextEditor.svelte';
	import type { Editor } from '$lib/sessions';

	export let editor: Writable<Editor>;
	export let model: string;
	export let handleSubmit: () => void;
	export let stopCompletion: () => void;
	export let scrollToBottom: (shouldForceScroll: boolean) => void;

	function toggleCodeEditor() {
		$editor.isCodeEditor = !$editor.isCodeEditor;
		$editor.shouldFocusTextarea = !$editor.isCodeEditor;
	}

	function switchToMessages() {
		$editor.view = 'messages';
		scrollToBottom(true);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.shiftKey) return;
		if (event.key !== 'Enter') return;
		event.preventDefault();
		handleSubmit();
	}
</script>

<div class="prompt-editor" class:prompt-editor--fullscreen={$editor.isCodeEditor}>
	<div class="prompt-editor__form">
		<div class="prompt-editor__project">
			<FieldSelectModel isLabelVisible={false} bind:model />

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
						on:click={() => ($editor.view = 'controls')}
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
			<FieldTextEditor label={$LL.prompt()} {handleSubmit} bind:value={$editor.prompt} />
		{:else}
			<Field name="prompt">
				<textarea
					name="prompt"
					class="prompt-editor__textarea"
					placeholder={$LL.promptPlaceholder()}
					bind:this={$editor.promptTextarea}
					bind:value={$editor.prompt}
					on:keydown={handleKeyDown}
				/>
			</Field>
		{/if}

		<nav class="prompt-editor__toolbar">
			{#if $editor.messageIndexToEdit !== null}
				<Button
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
				{handleSubmit}
				hasMetaKey={$editor.isCodeEditor}
				disabled={!$editor.prompt || !model}
			>
				{$LL.run()}
			</ButtonSubmit>

			{#if $editor.isCompletionInProgress}
				<Button title="Stop completion" variant="outline" on:click={stopCompletion}>
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
		field-sizing: content;
		@apply base-input max-h-48 min-h-14 resize-none scroll-p-2 px-3 py-2;
	}

	.prompt-editor__toolbar {
		@apply flex items-stretch gap-x-2;
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
</style>
