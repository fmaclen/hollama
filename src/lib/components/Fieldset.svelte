<script lang="ts">
	export let isFullscreen: boolean | undefined = false;
</script>

<fieldset class="fieldset {isFullscreen ? 'fieldset--fullscreen' : ''}">
	<slot />
</fieldset>

<style lang="scss">
	.fieldset {
		@apply container flex mx-auto max-w-[80ch] flex-col gap-y-4 p-4;

		&--fullscreen {
			@apply h-full overflow-hidden;
		}
	}
</style>
