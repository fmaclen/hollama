<script lang="ts">
	import { onMount } from 'svelte';
	import { basicSetup } from 'codemirror';
	import { EditorView, keymap } from '@codemirror/view';
	import { Prec } from '@codemirror/state';

	export let value: string;
	export let handleSubmit: Function;

	let view: EditorView;
	let container: HTMLDivElement | null;
	let editorValue: string;

	const updateValue = EditorView.updateListener.of((view) => {
		if (view.docChanged) value = view.state.doc.toString();
	});

	// Disable default keymap for `Meta+Enter` to allow form submission
	// and prevent `insertNewline` in text editor.
	const overrideMetaEnterKeymap = keymap.of([
		{
			key: 'Mod-Enter',
			run: () => {
				console.warn('Meta+Enter key pressed');
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
				Prec.highest(overrideMetaEnterKeymap)
			],
			parent: container
		});

		return () => {
			view.destroy();
		};
	});
</script>

<div class="text-editor" bind:this={container}></div>

<style lang="scss">
	.text-editor {
		@apply h-full overflow-hidden rounded-md border border-input bg-neutral-50;

		:global(.cm-editor) {
			@apply h-full text-sm;
		}
	}
</style>
