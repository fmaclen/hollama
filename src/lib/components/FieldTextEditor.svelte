<script lang="ts">
	import { onMount } from 'svelte';
	import { basicSetup } from 'codemirror';
	import { EditorView, keymap } from '@codemirror/view';
	import { Prec } from '@codemirror/state';
	import Field from './Field.svelte';

	export let label: string;
	export let value: string;
	export let handleSubmit: (event?: Event) => void;

	let view: EditorView;
	let container: HTMLDivElement | null;
	let editorValue: string;

	const updateValue = EditorView.updateListener.of((view) => {
		if (view.docChanged) value = view.state.doc.toString();
	});

	// Disable default keymap for `Mod+Enter` to allow form submission
	// and prevent `insertNewline` in text editor.
	const overrideModEnterKeymap = keymap.of([
		{
			key: 'Mod-Enter',
			run: () => {
				handleSubmit();
				return true;
			}
		}
	]);

	onMount(() => {
		if (value !== editorValue) editorValue = value;

		if (!container) throw new Error('Text editor container not found');

		view = new EditorView({
			doc: editorValue,
			extensions: [
				basicSetup,
				updateValue,
				EditorView.lineWrapping,
				Prec.highest(overrideModEnterKeymap)
			],
			parent: container
		});

		return () => {
			view.destroy();
		};
	});
</script>

<Field name={label.toLocaleLowerCase()} class="h-full overflow-y-auto">
	<svelte:fragment slot="label">{label}</svelte:fragment>
	<div class="text-editor" bind:this={container}></div>
</Field>

<style lang="scss">
	@import '$lib/mixins.scss';

	.text-editor {
		@include base-input;
		@apply h-full max-h-full min-h-[88px] overflow-y-auto p-0;

		:global(.cm-editor) {
			@apply h-full w-full text-sm;
		}

		:global(.cm-gutters) {
			@apply border-shade-3 bg-shade-1;
		}

		:global(.cm-activeLineGutter) {
			@apply bg-shade-2 text-accent;
		}

		// HACK: Need to use !important to override the default styles because
		// CodeMirror's styles for text selection have higher specificity than ours.
		:global(.cm-activeLine) {
			background-color: hsl(var(--color-shade-6) / 10%) !important;
		}

		:global(.cm-activeLine.cm-line) {
			caret-color: hsl(var(--color-shade-6)) !important;
		}

		:global(.cm-selectionBackground) {
			background-color: hsl(var(--color-primary) / 50%) !important;
		}
	}
</style>
