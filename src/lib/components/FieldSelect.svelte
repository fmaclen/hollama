<script lang="ts">
	import Field from './Field.svelte';

	export let name: string;
	export let label: string;
	export let disabled: boolean | undefined = false;
	export let options: { value: string; option: string }[] = [];
	export let value: string | undefined = undefined;
</script>

<Field {name}>
	<svelte:fragment slot="label">{label}</svelte:fragment>
	<select id={name} class="select" {disabled} bind:value>
		<option></option>
		{#each options as { value, option }}
			<option {value}>{option}</option>
		{/each}
	</select>
</Field>

<style lang="scss">
	.select {
		@apply base-input;
	}
</style>
