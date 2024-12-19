<script lang="ts">
	import { Files } from 'lucide-svelte';

	import LL from '$i18n/i18n-svelte';

	import Button from './Button.svelte';

	export let content: string;

	async function copyContent() {
		let result = false;
		if (!navigator.clipboard) {
			const textArea = document.createElement('textarea');
			textArea.value = content;

			// Avoid scrolling to bottom
			textArea.style.top = '0';
			textArea.style.left = '0';
			textArea.style.position = 'fixed';

			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();

			try {
				const successful = document.execCommand('copy');
				const msg = successful ? 'successful' : 'unsuccessful';
				console.log('Fallback: Copying text command was ' + msg);
				result = true;
			} catch (err) {
				console.error('Fallback: Oops, unable to copy', err);
			}

			document.body.removeChild(textArea);
			return result;
		}

		result = await navigator.clipboard
			.writeText(content)
			.then(() => {
				console.log('Async: Copying to clipboard was successful!');
				return true;
			})
			.catch((error) => {
				console.error('Async: Could not copy text: ', error);
				return false;
			});

		return result;
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
