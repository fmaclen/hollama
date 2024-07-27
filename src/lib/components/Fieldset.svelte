<script lang="ts">
	export let isFullscreen: boolean | undefined = false;
</script>

<fieldset class="fieldset {isFullscreen ? 'fieldset--fullscreen' : ''}">
	<slot />
</fieldset>

<style lang="postcss">
	.fieldset {
		@apply container mx-auto flex max-w-[80ch] flex-col gap-y-4 p-4;
		@apply lg:p-6;

		&--fullscreen {
			@apply h-full overflow-hidden;
		}
	}
</style>
