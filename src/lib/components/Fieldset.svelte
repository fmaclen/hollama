<script lang="ts">
	export let isFullscreen: boolean | undefined = false;
</script>

<fieldset class="fieldset {isFullscreen ? 'fieldset--fullscreen' : ''}">
	<slot />
</fieldset>

<style lang="scss">
	.fieldset {
		@apply container flex mx-auto max-w-prose flex-col gap-y-8;

		&--fullscreen {
			@apply h-full py-6 overflow-hidden;
		}
	}
</style>
