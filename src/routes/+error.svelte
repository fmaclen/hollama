<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import { page } from '$app/stores';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
</script>

<section class="error">
	<div class="error-message">
		{#if $page.status === 404}
			<EmptyMessage>
				<strong>{$LL.error()} {$page.status}</strong>
				<span>{$LL.notFound()}</span>
			</EmptyMessage>
		{:else if $page.status !== 200}
			<EmptyMessage>
				<strong>{$LL.error()} {$page.status}</strong>
				<span>{$LL.internalServerError()}</span>
			</EmptyMessage>
		{/if}
	</div>
</section>

<style lang="postcss">
	.error {
		@apply base-section base-section-fullscreen flex gap-x-8 px-6;

		strong {
			@apply mr-4 text-nowrap;
		}

		span {
			@apply border-l pl-4;
		}
	}

	.error-message {
		@apply my-auto flex flex-col gap-y-12;
	}
</style>
