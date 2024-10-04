<script lang="ts">
	export let confirmDeletion: boolean = false;
</script>

<header class="header" class:header--confirm-deletion={confirmDeletion}>
	<div class="header__headline">
		<slot />
	</div>

	<nav class="header__nav">
		<slot name="nav" />
	</nav>
</header>

<style lang="postcss">
	.header {
		@apply flex items-center justify-between border-b bg-shade-1 py-2 px-4 text-xs;

		&--confirm-deletion {
			@apply confirm-deletion;
		}
	}

	.header__headline {
		@apply flex gap-2 items-center;
	}

	.header__nav {
		@apply flex flex-row items-center;
	}
</style>
