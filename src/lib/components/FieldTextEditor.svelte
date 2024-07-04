<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import * as monaco from 'monaco-editor';
	import './FieldTextEdtor';

	export let value: string;
	let container: HTMLDivElement | null;
  let editor: monaco.editor.IStandaloneCodeEditor;

	onMount(() => {
		if (!container) throw new Error('TextEditor container not found');

		editor = monaco.editor.create(container, {
			value,
			language: 'plaintext',
			minimap: { enabled: false },
			scrollBeyondLastLine: false,
			quickSuggestions: false,
			selectionHighlight: false,
			wordWrap: 'on',
			codeLens: false,
			fontSize: 14
		});

		editor.onDidChangeModelContent((event) => {
			value = editor.getValue();
		});
	});

  onDestroy(() => {
    editor?.dispose();
  });
</script>

<div class="text-editor" bind:this={container}></div>

<style lang="scss">
	.text-editor {
		@apply h-full overflow-hidden rounded-md border border-input bg-neutral-50;

		:global(.monaco-editor) {
			@apply h-full rounded-md p-0 outline-none;
		}

		:global(.line-numbers) {
			@apply text-neutral-200;
		}

		:global(.active-line-number) {
			@apply text-neutral-400;
		}

		:global(.mtk1) {
			@apply text-neutral-800;
		}
	}
</style>
