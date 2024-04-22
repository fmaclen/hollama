<script lang="ts">
	import type { OllamaModel } from "$lib/ollama";
	import Label from "./Label.svelte";

	export let models: OllamaModel[];
  export let value: string;
</script>

<Label>Model</Label>
<select
	class="select"
	disabled={!models.length}
  bind:value
>
  {#each models as model}
    <option value={model.name}>{model.name}</option>
  {/each}
</select>

<style lang="scss">
	.select {
		@apply flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
	}
</style>
