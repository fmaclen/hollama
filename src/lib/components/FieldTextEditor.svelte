<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';

	export let value: string;
	export let handleSubmit: Function;

	let view: EditorView;
	let container: HTMLDivElement | null;
	let editorValue: string;

	function handleKeyDown(event: KeyboardEvent) {
		if (!handleSubmit) return;

		if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
			event.preventDefault();
			handleSubmit();
		}
	}

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

		// Listen for keydown events to handle submitting with the keyboard shortcut
		view.dom.addEventListener('keydown', handleKeyDown);

		return () => {
			view.destroy();
			view.dom.removeEventListener('keydown', handleKeyDown);
		};
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
