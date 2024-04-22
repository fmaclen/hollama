<label class="label"><slot /></label>

<style lang="scss">
	.label {
		@apply flex items-center gap-x-2 text-sm font-medium leading-none
		peer-disabled:cursor-not-allowed
		peer-disabled:opacity-70;
	}
</style>
