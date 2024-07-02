<script lang="ts">
	let className: string | undefined = undefined;
	export { className as class };
	export let name: string;
</script>

<label class="label {className}" for={name}>
	<p class="title">
		<slot name="title" />
	</p>
	<slot />
</label>

<style lang="scss">
	.label {
		@apply flex w-full flex-col gap-y-3;
	}

	.title {
		@apply flex items-center gap-x-2 text-sm font-medium leading-none;
	}
</style>
