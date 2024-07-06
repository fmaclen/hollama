<script lang="ts">
	import { onMount } from 'svelte';
	import { basicSetup } from 'codemirror';
	import { EditorView, keymap } from '@codemirror/view';
	import { Prec } from '@codemirror/state';
	import Field from './Field.svelte';

	export let label: string;
	export let value: string;
	export let handleSubmit: Function;

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

<Field name="content" class="h-full overflow-y-auto">
	<svelte:fragment slot="label">{label}</svelte:fragment>
	<div class="text-editor" bind:this={container}></div>
</Field>

<style lang="scss">
	.text-editor {
		@apply h-full max-h-full overflow-y-auto rounded-md border border-input bg-neutral-50;

		:global(.cm-editor) {
			@apply h-full text-sm;
		}
	}
</style>
