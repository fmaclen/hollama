<nav class="field-with-nav">
	<slot />
</nav>

<style lang="postcss">
	.field-with-nav {
		@apply grid grid-cols-[1fr,max] items-end gap-x-3;
	}
</style>
