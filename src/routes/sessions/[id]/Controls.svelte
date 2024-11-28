<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import FieldCheckbox from '$lib/components/FieldCheckbox.svelte';
	import FieldInput from '$lib/components/FieldInput.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { loadKnowledge } from '$lib/knowledge';
	import { knowledgeStore } from '$lib/localStorage';
	import type { Session } from '$lib/sessions';

	import KnowledgeSelect from './KnowledgeSelect.svelte';

	const DEFAULT_MIROSTAT = '0';
	const DEFAULT_MIROSTAT_ETA = '0.1';
	const DEFAULT_MIROSTAT_TAU = '5.0';
	const DEFAULT_NUM_CTX = '2048';
	const DEFAULT_REPEAT_LAST_N = '64';
	const DEFAULT_REPEAT_PENALTY = '1.1';
	const DEFAULT_TEMPERATURE = '0.8';
	const DEFAULT_SEED = $LL.random();
	const DEFAULT_STOP = $LL.automatic();
	const DEFAULT_TFS_Z = '1';
	const DEFAULT_NUM_PREDICT = '128';
	const DEFAULT_TOP_K = '40';
	const DEFAULT_TOP_P = '0.9';
	const DEFAULT_MIN_P = '0.0';
	const DEFAULT_NUM_BATCH = $LL.automatic();
	const DEFAULT_NUM_GPU = $LL.automatic();
	const DEFAULT_MAIN_GPU = $LL.automatic();
	const DEFAULT_NUM_THREAD = $LL.automatic();
	const DEFAULT_NUM_KEEP = $LL.automatic();
	const DEFAULT_TYPICAL_P = $LL.automatic();
	const DEFAULT_PRESENCE_PENALTY = $LL.automatic();
	const DEFAULT_FREQUENCY_PENALTY = $LL.automatic();

	interface Props {
		session: Session;
	}

	let { session = $bindable() }: Props = $props();

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
		<P><strong>{$LL.systemPrompt()}</strong></P>
		<KnowledgeSelect bind:value={knowledgeId} bind:options={$knowledgeStore} showNav={true} />
	</Fieldset>

	<Fieldset>
		<P><strong>{$LL.modelOptions()}</strong></P>
		<div class="control-inputs">
			<FieldInput
				name="num_keep"
				label={$LL.numKeep()}
				type="number"
				min={0}
				step={1}
				placeholder={DEFAULT_NUM_KEEP}
				bind:value={session.options.num_keep}
			/>
			<FieldInput
				name="seed"
				label={$LL.seed()}
				type="number"
				min={0}
				step={1}
				placeholder={DEFAULT_SEED}
				bind:value={session.options.seed}
			/>
			<FieldInput
				name="num_predict"
				label={$LL.numPredict()}
				type="number"
				min={-2}
				step={1}
				placeholder={DEFAULT_NUM_PREDICT}
				bind:value={session.options.num_predict}
			/>
			<FieldInput
				name="top_k"
				label={$LL.topK()}
				type="number"
				min={1}
				step={1}
				placeholder={DEFAULT_TOP_K}
				bind:value={session.options.top_k}
			/>
			<FieldInput
				name="top_p"
				label={$LL.topP()}
				type="number"
				min={0}
				max={1}
				step={0.05}
				placeholder={DEFAULT_TOP_P}
				bind:value={session.options.top_p}
			/>
			<FieldInput
				name="min_p"
				label={$LL.minP()}
				type="number"
				min={0}
				max={1}
				step={0.01}
				placeholder={DEFAULT_MIN_P}
				bind:value={session.options.min_p}
			/>
			<FieldInput
				name="tfs_z"
				label={$LL.tfsZ()}
				type="number"
				min={1}
				step={0.1}
				placeholder={DEFAULT_TFS_Z}
				bind:value={session.options.tfs_z}
			/>
			<FieldInput
				name="typical_p"
				label={$LL.typicalP()}
				type="number"
				min={0}
				max={1}
				step={0.01}
				placeholder={DEFAULT_TYPICAL_P}
				bind:value={session.options.typical_p}
			/>
			<FieldInput
				name="repeat_last_n"
				label={$LL.repeatLastN()}
				type="number"
				min={-1}
				step={1}
				placeholder={DEFAULT_REPEAT_LAST_N}
				bind:value={session.options.repeat_last_n}
			/>
			<FieldInput
				name="temperature"
				label={$LL.temperature()}
				type="number"
				min={0}
				max={2}
				step={0.1}
				placeholder={DEFAULT_TEMPERATURE}
				bind:value={session.options.temperature}
			/>
			<FieldInput
				name="repeat_penalty"
				label={$LL.repeatPenalty()}
				type="number"
				step={0.1}
				placeholder={DEFAULT_REPEAT_PENALTY}
				bind:value={session.options.repeat_penalty}
			/>
			<FieldInput
				name="presence_penalty"
				label={$LL.presencePenalty()}
				type="number"
				step={0.01}
				placeholder={DEFAULT_PRESENCE_PENALTY}
				bind:value={session.options.presence_penalty}
			/>
			<FieldInput
				name="frequency_penalty"
				label={$LL.frequencyPenalty()}
				type="number"
				step={0.01}
				placeholder={DEFAULT_FREQUENCY_PENALTY}
				bind:value={session.options.frequency_penalty}
			/>
			<FieldInput
				name="mirostat"
				label={$LL.mirostat()}
				type="number"
				min={0}
				max={2}
				step={1}
				placeholder={DEFAULT_MIROSTAT}
				bind:value={session.options.mirostat}
			/>
			<FieldInput
				name="mirostat_tau"
				label={$LL.mirostatTau()}
				type="number"
				step={0.1}
				placeholder={DEFAULT_MIROSTAT_TAU}
				bind:value={session.options.mirostat_tau}
			/>
			<FieldInput
				name="mirostat_eta"
				label={$LL.mirostatEta()}
				type="number"
				step={0.01}
				placeholder={DEFAULT_MIROSTAT_ETA}
				bind:value={session.options.mirostat_eta}
			/>
			<FieldInput
				name="stop"
				label={$LL.stop()}
				type="text"
				placeholder={DEFAULT_STOP}
				bind:value={stop}
			/>
		</div>
		<div class="control-checkboxes">
			<FieldCheckbox
				label={$LL.penalizeNewline()}
				bind:checked={session.options.penalize_newline}
				name="penalize_newline"
			/>
		</div>
	</Fieldset>

	<Fieldset>
		<P><strong>{$LL.runtimeOptions()}</strong></P>
		<div class="control-inputs">
			<FieldInput
				name="num_ctx"
				label={$LL.numCtx()}
				type="number"
				min={1}
				step={1}
				placeholder={DEFAULT_NUM_CTX}
				bind:value={session.options.num_ctx}
			/>
			<FieldInput
				name="num_batch"
				label={$LL.numBatch()}
				type="number"
				min={1}
				step={1}
				placeholder={DEFAULT_NUM_BATCH}
				bind:value={session.options.num_batch}
			/>
			<FieldInput
				name="num_gpu"
				label={$LL.numGpu()}
				type="number"
				min={0}
				step={1}
				placeholder={DEFAULT_NUM_GPU}
				bind:value={session.options.num_gpu}
			/>
			<FieldInput
				name="main_gpu"
				label={$LL.mainGpu()}
				type="number"
				min={0}
				step={1}
				placeholder={DEFAULT_MAIN_GPU}
				bind:value={session.options.main_gpu}
			/>
			<FieldInput
				name="num_thread"
				label={$LL.numThread()}
				type="number"
				min={1}
				step={1}
				placeholder={DEFAULT_NUM_THREAD}
				bind:value={session.options.num_thread}
			/>
		</div>
		<div class="control-checkboxes">
			<FieldCheckbox label={$LL.numa()} bind:checked={session.options.numa} name="numa" />
			<FieldCheckbox
				label={$LL.lowVram()}
				bind:checked={session.options.low_vram}
				name="low_vram"
			/>
			<FieldCheckbox label={$LL.f16Kv()} bind:checked={session.options.f16_kv} name="f16_kv" />
			<FieldCheckbox
				label={$LL.vocabOnly()}
				bind:checked={session.options.vocab_only}
				name="vocab_only"
			/>
			<FieldCheckbox
				label={$LL.useMmap()}
				bind:checked={session.options.use_mmap}
				name="use_mmap"
			/>
			<FieldCheckbox
				label={$LL.useMlock()}
				bind:checked={session.options.use_mlock}
				name="use_mlock"
			/>
		</div>
	</Fieldset>
</div>

<style lang="postcss">
	.controls {
		@apply base-fieldset-container flex h-full flex-col gap-y-6 overflow-scroll;
		@apply md:gap-y-8;
	}

	.control-inputs {
		@apply grid grid-cols-2 gap-2;
	}

	.control-checkboxes {
		@apply flex w-full flex-wrap gap-2;
	}
</style>
