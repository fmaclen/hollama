<script lang="ts">
	import { onMount } from 'svelte';

	import { EditorView, basicSetup } from 'codemirror';

	export let value: string;
	let container: HTMLDivElement | null;

	onMount(() => {
		if (!container) throw new Error('Text editor container not found');

		new EditorView({
			doc: value,
			extensions: basicSetup,
			parent: container
		});
	});
</script>

<div class="text-editor" bind:this={container}></div>

<style lang="scss">
	.text-editor {
		@apply h-full overflow-hidden rounded-md border border-input bg-neutral-50;

		// :global(.monaco-editor) {
		// 	@apply h-full rounded-md p-0 outline-none;
		// }

		// :global(.line-numbers) {
		// 	@apply text-neutral-200;
		// }

		// :global(.active-line-number) {
		// 	@apply text-neutral-400;
		// }

		// :global(.mtk1) {
		// 	@apply text-neutral-800;
		// }
	}
</style>
