<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';

	export let value: string;

	let view: EditorView;
	let container: HTMLDivElement | null;
	let editorValue: string;

	onMount(() => {
		// We only want to update the `editorValue` when the component mounts, then
		// the editor updates the bounded `value` back to the parent component.
		if (value !== editorValue) editorValue = value;

		if (!container) throw new Error('Text editor container not found');

		view = new EditorView({
			doc: editorValue,
			extensions: [basicSetup, updateValue, EditorView.lineWrapping],
			parent: container
		});

		return () => view.destroy();
	});

	const updateValue = EditorView.updateListener.of((view) => {
		if (view.docChanged) value = view.state.doc.toString();
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
