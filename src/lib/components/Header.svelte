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

<style lang="scss">
	@import '$lib/mixins.scss';

	.header {
		@include delete-record-overlay;
		@apply flex items-end justify-between border-b bg-shade-1;
	}

	.header__headline {
		@apply flex flex-col gap-y-2 p-4;
		@apply lg:p-6;
	}

	.header__nav {
		@apply flex flex-row items-center gap-x-2 pr-4 pb-4;
		@apply lg:pr-6 lg:pb-6;
	}
</style>
