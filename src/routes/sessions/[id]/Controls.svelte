<script lang="ts">
	import type { ModelParameters } from '#lib/chat/ollama.js';
	import FieldInput from '#lib/components/FieldInput.svelte';
	import FieldSelect from '#lib/components/FieldSelect.svelte';
	import Fieldset from '#lib/components/Fieldset.svelte';
	import P from '#lib/components/P.svelte';
	import { loadKnowledge } from '#lib/knowledge.js';
	import { knowledgeStore } from '#lib/localStorage.js';
	import { m } from '#lib/paraglide/messages.js';
	import type { Session } from '#lib/sessions.js';

	import KnowledgeSelect from './KnowledgeSelect.svelte';

	type CommonOption =
		| 'temperature'
		| 'top_p'
		| 'top_k'
		| 'min_p'
		| 'repeat_penalty'
		| 'num_predict'
		| 'seed'
		| 'stop';

	// What Ollama uses when neither the request nor the model sets a value, per
	// `DefaultOptions()` in its `api/types.go`. Context size isn't here: Ollama picks it
	// at load time and doesn't report it, so its field always says Auto.
	const OLLAMA_DEFAULTS: Record<CommonOption, string> = {
		temperature: '0.8',
		top_p: '0.9',
		top_k: '40',
		min_p: '0.0',
		repeat_penalty: '1.0',
		num_predict: '-1',
		seed: m.random(),
		stop: m.automatic()
	};

	interface Props {
		session: Session;
		isOllamaModel: boolean;
		modelParameters: ModelParameters | undefined;
	}

	let { session = $bindable(), isOllamaModel, modelParameters }: Props = $props();

	function placeholder(key: CommonOption): string {
		return modelParameters?.[key] ?? OLLAMA_DEFAULTS[key];
	}

	// Auto leaves `use_mmap` out of the request so Ollama decides
	const useMmap = $derived(
		session.options.use_mmap === undefined ? 'auto' : session.options.use_mmap ? 'on' : 'off'
	);

	function handleUseMmapChange({ value }: { value: string }) {
		if (value === 'auto') delete session.options.use_mmap;
		else session.options.use_mmap = value === 'on';
	}

	// HACK: Stop is a `string[]` so we are hardcoding it to a single value for now
	let stop: string = $state(session.options.stop?.[0] ?? '');
	let knowledgeId: string | undefined = $state();

	$effect(() => {
		if (stop) session.options.stop = [stop];
	});

	$effect(() => {
		if (session.systemPrompt.knowledge && !knowledgeId) {
			// Initial load: set knowledgeId if knowledge exists
			knowledgeId = session.systemPrompt.knowledge.id;
		} else if (knowledgeId !== session.systemPrompt.knowledge?.id) {
			// Knowledge selection changed
			if (knowledgeId) {
				const knowledge = loadKnowledge(knowledgeId);
				session.systemPrompt.knowledge = knowledge;
				session.systemPrompt.content = knowledge.content;
			} else {
				// Clear knowledge if knowledgeId is undefined
				session.systemPrompt.knowledge = undefined;
				session.systemPrompt.content = '';
			}
		}
	});
</script>

<div class="controls">
	<Fieldset>
		<P><strong>{m.systemPrompt()}</strong></P>
		<KnowledgeSelect bind:value={knowledgeId} bind:options={$knowledgeStore} showNav={true} />
	</Fieldset>

	{#if isOllamaModel}
		<Fieldset>
			<P><strong>{m.modelOptions()}</strong></P>
			<div class="control-inputs">
				<FieldInput
					name="temperature"
					label={m.temperature()}
					type="number"
					min={0}
					max={2}
					step={0.1}
					placeholder={placeholder('temperature')}
					bind:value={session.options.temperature}
				/>
				<FieldInput
					name="top_p"
					label={m.topP()}
					type="number"
					min={0}
					max={1}
					step={0.05}
					placeholder={placeholder('top_p')}
					bind:value={session.options.top_p}
				/>
				<FieldInput
					name="top_k"
					label={m.topK()}
					type="number"
					min={1}
					step={1}
					placeholder={placeholder('top_k')}
					bind:value={session.options.top_k}
				/>
				<FieldInput
					name="min_p"
					label={m.minP()}
					type="number"
					min={0}
					max={1}
					step={0.01}
					placeholder={placeholder('min_p')}
					bind:value={session.options.min_p}
				/>
				<FieldInput
					name="repeat_penalty"
					label={m.repeatPenalty()}
					type="number"
					step={0.1}
					placeholder={placeholder('repeat_penalty')}
					bind:value={session.options.repeat_penalty}
				/>
				<FieldInput
					name="num_predict"
					label={m.numPredict()}
					type="number"
					min={-2}
					step={1}
					placeholder={placeholder('num_predict')}
					bind:value={session.options.num_predict}
				/>
				<FieldInput
					name="seed"
					label={m.seed()}
					type="number"
					min={0}
					step={1}
					placeholder={placeholder('seed')}
					bind:value={session.options.seed}
				/>
				<FieldInput
					name="stop"
					label={m.stop()}
					type="text"
					placeholder={placeholder('stop')}
					bind:value={stop}
				/>
				<FieldInput
					name="num_ctx"
					label={m.numCtx()}
					type="number"
					min={1}
					step={1}
					placeholder={m.automatic()}
					bind:value={session.options.num_ctx}
				/>
			</div>
		</Fieldset>

		<Fieldset>
			<P><strong>{m.advancedOptions()}</strong></P>
			<div class="control-inputs">
				<FieldInput
					name="num_keep"
					label={m.numKeep()}
					type="number"
					min={0}
					step={1}
					placeholder={m.automatic()}
					bind:value={session.options.num_keep}
				/>
				<FieldInput
					name="repeat_last_n"
					label={m.repeatLastN()}
					type="number"
					min={-1}
					step={1}
					placeholder={m.automatic()}
					bind:value={session.options.repeat_last_n}
				/>
				<FieldInput
					name="presence_penalty"
					label={m.presencePenalty()}
					type="number"
					step={0.01}
					placeholder={m.automatic()}
					bind:value={session.options.presence_penalty}
				/>
				<FieldInput
					name="frequency_penalty"
					label={m.frequencyPenalty()}
					type="number"
					step={0.01}
					placeholder={m.automatic()}
					bind:value={session.options.frequency_penalty}
				/>
				<FieldInput
					name="num_batch"
					label={m.numBatch()}
					type="number"
					min={1}
					step={1}
					placeholder={m.automatic()}
					bind:value={session.options.num_batch}
				/>
				<FieldInput
					name="num_gpu"
					label={m.numGpu()}
					type="number"
					min={0}
					step={1}
					placeholder={m.automatic()}
					bind:value={session.options.num_gpu}
				/>
				<FieldInput
					name="main_gpu"
					label={m.mainGpu()}
					type="number"
					min={0}
					step={1}
					placeholder={m.automatic()}
					bind:value={session.options.main_gpu}
				/>
				<FieldInput
					name="num_thread"
					label={m.numThread()}
					type="number"
					min={1}
					step={1}
					placeholder={m.automatic()}
					bind:value={session.options.num_thread}
				/>
				<FieldSelect
					name="use_mmap"
					label={m.useMmap()}
					allowClear={false}
					allowSearch={false}
					value={useMmap}
					options={[
						{ value: 'auto', label: m.automatic() },
						{ value: 'on', label: m.reasoningOn() },
						{ value: 'off', label: m.reasoningOff() }
					]}
					onChange={handleUseMmapChange}
				/>
			</div>
		</Fieldset>
	{/if}
</div>

<style lang="postcss">
	.controls {
		@apply base-fieldset-container flex h-full flex-col gap-y-6 overflow-scroll;
		@apply md:gap-y-8;
	}

	.control-inputs {
		@apply grid grid-cols-2 gap-2;
	}
</style>
