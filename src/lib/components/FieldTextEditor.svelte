<script lang="ts">
	import { onMount } from 'svelte';
	import { basicSetup } from 'codemirror';
	import { EditorView, keymap } from '@codemirror/view';
	import { Prec } from '@codemirror/state';
	import { tomorrow, boysAndGirls } from 'thememirror';
	import { settingsStore } from '$lib/store';
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
				Prec.highest(overrideModEnterKeymap),
				$settingsStore?.userTheme === 'dark' ? boysAndGirls : tomorrow
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

<style lang="postcss">
	.text-editor {
		@apply base-input;
		@apply h-full max-h-full min-h-[88px] overflow-y-auto p-0;

		:global(.cm-editor) {
			@apply h-full w-full text-sm;
		}
	}
</style>
