<fieldset class="fieldset">
	<slot />
</fieldset>

<style lang="postcss">
	.fieldset {
		@apply container mx-auto flex max-w-[80ch] flex-col gap-y-3;
	}
</style>
