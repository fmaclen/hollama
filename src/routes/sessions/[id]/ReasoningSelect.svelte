<script lang="ts">
	import type { ThinkingLevels, ThinkLevel } from '#lib/chat/ollama.js';
	import FieldSelect from '#lib/components/FieldSelect.svelte';
	import { settingsStore } from '#lib/localStorage.js';
	import { m } from '#lib/paraglide/messages.js';
	import type { Model } from '#lib/settings.js';

	interface Props {
		model: Model | undefined;
		levels: ThinkingLevels | undefined;
	}

	let { model, levels }: Props = $props();

	const modelName = $derived(model?.name);

	function formatLevel(level: ThinkLevel): string {
		switch (level) {
			case false:
				return m.reasoningOff();
			case true:
				return m.reasoningOn();
			case 'low':
				return m.reasoningLow();
			case 'medium':
				return m.reasoningMedium();
			case 'high':
				return m.reasoningHigh();
			default:
				return String(level);
		}
	}

	const options = $derived(
		levels?.values.map((level) => ({ value: String(level), label: formatLevel(level) })) ?? []
	);

	const value = $derived(
		levels && modelName
			? String($settingsStore.reasoningLevels?.[modelName] ?? levels.default)
			: undefined
	);

	function handleChange({ value }: { value: string }) {
		const level = levels?.values.find((l) => String(l) === value);
		if (level === undefined || !modelName) return;
		// Leave `think` out of requests while it matches the model's default
		const reasoningLevels = { ...$settingsStore.reasoningLevels };
		if (level === levels?.default) delete reasoningLevels[modelName];
		else reasoningLevels[modelName] = level;
		$settingsStore.reasoningLevels = reasoningLevels;
	}
</script>

{#if levels}
	<div class="reasoning-select">
		<FieldSelect
			name="reasoning"
			label={m.reasoning()}
			isLabelVisible={false}
			allowClear={false}
			allowSearch={false}
			{value}
			options={[{ label: m.reasoning(), options }]}
			onChange={handleChange}
		/>
	</div>
{/if}

<style lang="postcss">
	.reasoning-select {
		@apply md:w-28;
	}

	.reasoning-select :global(.field-combobox-input) {
		@apply pr-8;
	}
</style>
