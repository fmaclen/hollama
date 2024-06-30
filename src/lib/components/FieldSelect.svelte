<script lang="ts">
	import Field from './Field.svelte';

	export let name: string;
	export let label: string;
	export let disabled: boolean | undefined = false;
	export let options: { value: string; option: string }[] = [];
	export let value: string | undefined = undefined;
</script>

<Field {name}>
	<span slot="title">{label}</span>
	<select id={name} class="select" {disabled} bind:value>
		<option></option>
		{#each options as { value, option }}
			<option {value}>{option}</option>
		{/each}
	</select>
</Field>

<style lang="scss">
	.select {
		@apply flex h-10 w-full rounded-md border border-input bg-elevation-0 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
	}
</style>
