<script lang="ts">
	import { OllamaStrategy, type ThinkingLevels, type ThinkLevel } from '#lib/chat/ollama.js';
	import FieldSelect from '#lib/components/FieldSelect.svelte';
	import { ConnectionType } from '#lib/connections.js';
	import { serversStore, settingsStore } from '#lib/localStorage.js';
	import { m } from '#lib/paraglide/messages.js';
	import type { Model } from '#lib/settings.js';

	interface Props {
		model: Model | undefined;
	}

	let { model }: Props = $props();

	let levels: ThinkingLevels | undefined = $state();

	const server = $derived($serversStore.find((s) => s.id === model?.serverId));
	const modelName = $derived(model?.name);

	$effect(() => {
		const name = modelName;
		levels = undefined;
		if (!name || server?.connectionType !== ConnectionType.Ollama) return;

		new OllamaStrategy(server)
			.getThinkingLevels(name)
			.then((result) => {
				if (modelName === name) levels = result;
			})
			.catch(() => {
				levels = undefined;
			});
	});

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
