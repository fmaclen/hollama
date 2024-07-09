<header class="header">
	<div class="space-y-2">
		<slot />
	</div>

	{#if $$slots.nav}
		<nav>
			<slot name="nav" />
		</nav>
	{/if}
</header>

<style>
	.header {
		@apply flex items-center justify-between border-b px-6 py-6;
	}
</style>
