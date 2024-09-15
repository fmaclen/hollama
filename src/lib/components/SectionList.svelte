<nav class="section-list">
	<slot />
</nav>

<style lang="postcss">
	.section-list {
		@apply overflow-scrollbar flex h-full flex-col;
	}
</style>
