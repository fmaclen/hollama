<script lang="ts">
	export let isFullscreen: boolean | undefined = false;
</script>

<fieldset class="fieldset {isFullscreen ? 'fieldset--fullscreen' : ''}">
	<slot />
</fieldset>

<style lang="scss">
	.fieldset {
		@apply container mx-auto flex max-w-full flex-col gap-y-6 xl:max-w-[70%];

		&--fullscreen {
			@apply h-full py-6 overflow-hidden;
		}
	}
</style>
