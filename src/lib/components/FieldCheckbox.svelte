<script lang="ts">
	export let label: string;
	export let checked: boolean | undefined = undefined;
	export let name: string = '';
</script>

<label class="field-checkbox">
	<input type="checkbox" bind:checked class="field-checkbox__input" {name} />
	{label}
</label>

<style lang="postcss">
	.field-checkbox {
		@apply inline-flex flex-grow items-center gap-x-2 text-balance rounded-md border border-shade-4 px-3 py-2 text-sm leading-tight;
		@apply hover:border-shade-6 hover:text-active;
	}

	.field-checkbox__input {
		@apply accent-accent;
	}
</style>
