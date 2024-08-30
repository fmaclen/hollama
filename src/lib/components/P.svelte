<p class="p">
	<slot />
</p>

<style lang="postcss">
	.p {
		@apply text-sm;

		:global(strong) {
			@apply font-medium leading-none;
		}
	}
</style>
