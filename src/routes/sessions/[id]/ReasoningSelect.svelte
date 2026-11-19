<script lang="ts">
	import { OllamaStrategy, type ThinkingLevels, type ThinkLevel } from '#lib/chat/ollama.js';
	import FieldSelect from '#lib/components/FieldSelect.svelte';
	import { ConnectionType } from '#lib/connections.js';
	import { serversStore } from '#lib/localStorage.js';
	import { m } from '#lib/paraglide/messages.js';
	import type { Session } from '#lib/sessions.js';

	interface Props {
		session: Session;
	}

	let { session = $bindable() }: Props = $props();

	let levels: ThinkingLevels | undefined = $state();

	const server = $derived($serversStore.find((s) => s.id === session.model?.serverId));
	const modelName = $derived(session.model?.name);

	$effect(() => {
		const name = modelName;
		levels = undefined;
		if (!name || server?.connectionType !== ConnectionType.Ollama) return;

		new OllamaStrategy(server)
			.getThinkingLevels(name)
			.then((result) => {
				if (modelName !== name) return;
				levels = result;
				// Ollama errors when sent a level the model doesn't support
				if (session.think !== undefined && !result?.values.includes(session.think)) {
					session.think = undefined;
				}
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

	const value = $derived(levels ? String(session.think ?? levels.default) : undefined);

	function handleChange({ value }: { value: string }) {
		const level = levels?.values.find((l) => String(l) === value);
		if (level === undefined) return;
		// Leave `think` out of requests while it matches the model's default
		session.think = level === levels?.default ? undefined : level;
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
