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
	import Fieldset from '$lib/components/Fieldset.svelte';
	import FieldTextEditor from '$lib/components/FieldTextEditor.svelte';
	import { settingsStore } from '$lib/localStorage';
	import type { Prompt, Session } from '$lib/sessions';

	export let prompt: Writable<Prompt>;
	export let handleSubmit: () => void;
	export let stopCompletion: () => void;

	// FIXME this always focuses on the textarea when typing on any field in <controls>
	// $: $prompt.shouldFocusTextarea = !$prompt.isCodeEditor;

	function handleKeyDown(event: KeyboardEvent) {
		if (event.shiftKey) return;
		if (event.key !== 'Enter') return;
		event.preventDefault();
		handleSubmit();
	}
</script>

<div class="prompt-editor {$prompt.isCodeEditor ? 'prompt-editor--fullscreen' : ''}">
	<button
		class="prompt-editor__toggle"
		on:click={() => ($prompt.isCodeEditor = !$prompt.isCodeEditor)}
	>
		<UnfoldVertical class="mx-auto my-2 h-3 w-3 opacity-50" />
	</button>

	<div class="prompt-editor__form">
		<Fieldset context={$prompt.isCodeEditor ? 'editor' : undefined}>
			<div class="prompt-editor__project">
				<FieldSelectModel />

				<nav class="prompt-editor__segmented-nav-container">
					<Button
						variant="icon"
						class={`prompt-editor__segmented-nav ${$prompt.view === 'messages' ? ' prompt-editor__segmented-nav--active' : ''}`}
						on:click={() => ($prompt.view = 'messages')}
					>
						<MessageSquareText class="base-icon" />
					</Button>
					<Button
						variant="icon"
						class={`prompt-editor__segmented-nav ${$prompt.view === 'options' ? ' prompt-editor__segmented-nav--active' : ''}`}
						on:click={() => ($prompt.view = 'options')}
					>
						<Settings_2 class="base-icon" />
					</Button>
				</nav>
			</div>

			{#if $prompt.isCodeEditor}
				<FieldTextEditor label={$LL.prompt()} {handleSubmit} bind:value={$prompt.content} />
			{:else}
				<Field name="prompt">
					<textarea
						name="prompt"
						class="prompt-editor__textarea"
						placeholder={$LL.promptPlaceholder()}
						bind:this={$prompt.promptTextarea}
						bind:value={$prompt.content}
						on:keydown={handleKeyDown}
					/>
				</Field>
			{/if}

			<nav class="prompt-editor__toolbar">
				{#if $prompt.messageIndexToEdit !== null}
					<Button
						variant="outline"
						on:click={() => {
							$prompt.content = '';
							$prompt.messageIndexToEdit = null;
							$prompt.isCodeEditor = false;
						}}
					>
						{$LL.cancel()}
					</Button>
				{/if}
				<ButtonSubmit
					{handleSubmit}
					hasMetaKey={$prompt.isCodeEditor}
					disabled={!prompt ||
						$settingsStore.ollamaServerStatus === 'disconnected' ||
						$settingsStore.ollamaModels.length === 0 ||
						!$settingsStore.ollamaModel}
				>
					{$LL.run()}
				</ButtonSubmit>

				{#if $prompt.isCompletionInProgress}
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
		</Fieldset>
	</div>
</div>

<style lang="postcss">
	.prompt-editor {
		@apply sticky bottom-0 z-10 mx-auto flex w-full flex-col border-t;
		@apply 2xl:max-w-[80ch] 2xl:rounded-t-lg 2xl:border-l 2xl:border-r;
	}

	.prompt-editor__project {
		@apply grid grid-cols-[auto,max-content] items-end gap-x-2;
	}

	.prompt-editor__segmented-nav-container {
		@apply flex h-full items-center rounded bg-shade-2 p-1;
	}

	:global(.prompt-editor__segmented-nav) {
		@apply h-full;
	}

	:global(.prompt-editor__segmented-nav--active) {
		@apply bg-shade-0 shadow;
	}

	.prompt-editor--fullscreen {
		@apply min-h-[60dvh];
	}

	.prompt-editor__form {
		@apply overflow-scrollbar h-full bg-shade-1;
	}

	.prompt-editor__toggle {
		@apply border-b bg-shade-1;
		@apply hover:bg-shade-2 active:bg-shade-2;
		@apply 2xl:rounded-t-lg;
	}

	.prompt-editor__textarea {
		@apply base-input min-h-16 resize-none scroll-p-2 px-3 py-2;
		@apply md:min-h-20;
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
</style>
