<script lang="ts">
	export let dataTestid: string | undefined = undefined;
</script>

<p class="metadata" data-testid={dataTestid}>
	<slot />
</p>

<style lang="scss">
	.metadata {
		@apply max-w-full truncate whitespace-nowrap text-xs text-muted;
	}
</style>
