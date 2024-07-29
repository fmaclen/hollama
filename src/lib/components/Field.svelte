<script lang="ts">
	let className: string | undefined = undefined;
	export { className as class };
	export let name: string;
</script>

<div class="field {className ?? ''}">
	<label class="field__label" for={name}>
		<slot name="label" />
	</label>

	<slot />
</div>

<style lang="postcss">
	.field {
		@apply flex w-full flex-col gap-y-2;
	}

	.field__label {
		@apply flex items-center gap-x-2 text-sm font-medium leading-none;
	}
</style>
