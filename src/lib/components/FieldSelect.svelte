<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import Field from './Field.svelte';

	export let name: string;
	export let label: string;
	export let disabled: boolean | undefined = false;
	export let options: { value: string; option: string }[] = [];
	export let value: string | undefined = undefined;
</script>

<Field {name} {disabled}>
	<svelte:fragment slot="label">{label}</svelte:fragment>
	<div class="select-container">
		<select id={name} class="select" {disabled} bind:value>
			<option></option>
			{#each options as { value, option }}
				<option {value}>{option}</option>
			{/each}
		</select>
		<ChevronDown class="bg-base -ml-2 mb-2 mr-2 h-4 w-4" />
	</div>
</Field>

<style lang="postcss">
	.select-container {
		@apply flex items-center;
	}

	.select {
		@apply base-input cursor-pointer appearance-none;
	}
</style>
