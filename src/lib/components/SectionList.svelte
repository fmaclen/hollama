<nav class="section-list">
	<slot />
</nav>

<style lang="postcss">
	.section-list {
		@apply flex h-full flex-col overflow-y-auto;
	}
</style>
