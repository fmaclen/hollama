<script lang="ts">
	import { Files } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	import LL from '$i18n/i18n-svelte';

	import Button from './Button.svelte';

	export let content: string;

	function copyContent() {
		if (navigator.clipboard && window.isSecureContext) {
			navigator.clipboard.writeText(content);
		} else {
			const textArea = document.createElement('textarea');
			textArea.value = content;
			document.body.appendChild(textArea);
			textArea.select();
			try {
				document.execCommand('copy');
				toast.success($LL.copiedNotPrivate());
			} catch (e) {
				console.error(e);
				toast.error($LL.notCopiedNotPrivate());
			}
			document.body.removeChild(textArea);
		}
	}
</script>

<div class="copy-button">
	<Button title={$LL.copy()} variant="icon" on:click={copyContent}>
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
