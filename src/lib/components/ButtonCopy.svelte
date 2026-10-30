<script lang="ts">
	import { Files } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	import { m } from '#lib/paraglide/messages.js';

	import Button from './Button.svelte';

	export let content: string;

	function copyContent() {
		if (navigator.clipboard && window.isSecureContext) {
			navigator.clipboard.writeText(content);
		} else {
			// HACK
			// This is a workaround to copy text content on HTTP connections.
			// https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem
			const textArea = document.createElement('textarea');
			textArea.value = content;
			document.body.appendChild(textArea);
			textArea.select();
			try {
				document.execCommand('copy');
				toast.warning(m.copiedNotPrivate());
			} catch (e) {
				console.error(e);
				toast.error(m.notCopiedNotPrivate());
			}
			document.body.removeChild(textArea);
		}
	}
</script>

<div class="copy-button">
	<Button title={m.copy()} variant="icon" on:click={copyContent}>
		<Files class="base-icon" />
	</Button>
</div>

<style lang="postcss">
	.copy-button {
		/* Hiding the button by default because this functionality is not supported on mobile devices */
		display: none;

		@media (hover: hover) {
			/* Show the button in devices that support hover (i.e. desktop) */
			display: unset;
		}
	}
</style>
