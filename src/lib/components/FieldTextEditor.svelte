<script lang="ts">
	import { Prec } from '@codemirror/state';
	import { EditorView, keymap } from '@codemirror/view';
	import { basicSetup } from 'codemirror';
	import { onMount } from 'svelte';
	import { createTheme } from 'thememirror';
	import type { LocalizedString } from 'typesafe-i18n';

	import { settingsStore } from '$lib/localStorage';

	import Field from './Field.svelte';

	export let label: LocalizedString;
	export let value: string;
	export let handleSubmit: ((event?: Event) => void) | undefined = undefined;

	let view: EditorView;
	let container: HTMLDivElement | null;
	let editorValue: string;

	// Re-render text editor when theme changes
	$: if (container) renderTextEditor();

	// REF https://thememirror.net/create
	const hollamaThemeLight = createTheme({
		variant: 'light',
		settings: {
			background: '#fff',
			foreground: '#333',
			caret: '#F97316',
			selection: '#F973161A', // Doesn't seem to work correctly
			lineHighlight: '#F973161A',
			gutterBackground: '#fff',
			gutterForeground: '#c0c0c0'
		},
		styles: [] // No styles for syntax highlighting
	});

	const hollamaThemeDark = createTheme({
		variant: 'dark',
		settings: {
			background: '#1e1e1e',
			foreground: '#c0c0c0',
			caret: '#F97316',
			selection: '#F973161A', // Doesn't seem to work correctly
			lineHighlight: '#F973161A',
			gutterBackground: '#222',
			gutterForeground: '#666'
		},
		styles: [] // No styles for syntax highlighting
	});

	const updateValue = EditorView.updateListener.of((view) => {
		if (view.docChanged) value = view.state.doc.toString();
	});

	// Disable default keymap for `Mod+Enter` to allow form submission
	// and prevent `insertNewline` in text editor.
	const overrideModEnterKeymap = keymap.of([
		{
			key: 'Mod-Enter',
			run: () => {
				handleSubmit?.();
				return true;
			}
		}
	]);

	function renderTextEditor() {
		if (view) view.destroy();
		if (value !== editorValue) editorValue = value;
		if (!container) throw new Error('Text editor container not found');

		view = new EditorView({
			doc: editorValue,
			extensions: [
				basicSetup,
				updateValue,
				EditorView.lineWrapping,
				Prec.highest(overrideModEnterKeymap),
				$settingsStore.userTheme === 'dark' ? hollamaThemeDark : hollamaThemeLight
			],
			parent: container
		});
	}

	onMount(() => {
		renderTextEditor();
		return () => view.destroy();
	});
</script>

<Field name={label.toLocaleLowerCase()} isTextEditor={true}>
	<svelte:fragment slot="label">{label}</svelte:fragment>
	<div class="text-editor" bind:this={container}></div>
</Field>

<style lang="postcss">
	.text-editor {
		@apply base-input;
		@apply overflow-scrollbar h-full max-h-full min-h-[88px] rounded-b-md p-0;

		:global(.cm-editor) {
			@apply h-full w-full text-sm;
		}
	}
</style>
