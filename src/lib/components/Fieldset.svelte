<script lang="ts">
	export let isFullscreen: boolean | undefined = false;
</script>

<fieldset class="fieldset {isFullscreen ? 'fieldset--fullscreen' : ''}">
	<slot></slot>
</fieldset>

<style lang="scss">
	.fieldset {
		@apply container mx-auto flex max-w-full xl:max-w-[70%] flex-col gap-y-3;

		&--fullscreen {
			@apply h-full py-12;
		}
	}
</style>
