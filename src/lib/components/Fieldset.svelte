<script lang="ts">
	export let isFullscreen: boolean | undefined = false;
</script>

<fieldset class="fieldset {isFullscreen ? 'fieldset--fullscreen' : ''}">
	<slot />
</fieldset>

<style lang="scss">
	.fieldset {
		@apply container mx-auto flex max-w-full xl:max-w-[96ch] flex-col gap-y-6;

		&--fullscreen {
			@apply h-full py-6 overflow-hidden xl:max-w-[96ch];
		}
	}
</style>
