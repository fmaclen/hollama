<header class="header">
	<div class="space-y-2">
		<slot />
	</div>

	<nav>
		<slot name="nav" />
	</nav>
</header>

<style>
	.header {
		@apply flex items-center justify-between border-b p-4;
		@apply lg:p-6;
	}
</style>
