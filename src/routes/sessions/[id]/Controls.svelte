<script lang="ts">
	import type { Writable } from 'svelte/store';

	import LL from '$i18n/i18n-svelte';
	import FieldInput from '$lib/components/FieldInput.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import FieldTextEditor from '$lib/components/FieldTextEditor.svelte';
	import type { OllamaOptions } from '$lib/ollama';


	const DEFAULT_MIROSTAT = '0';
	const DEFAULT_MIROSTAT_ETA = '0.1';
	const DEFAULT_MIROSTAT_TAU = '5.0';
	const DEFAULT_NUM_CTX = '2048';
	const DEFAULT_REPEAT_LAST_N = '64';
	const DEFAULT_REPEAT_PENALTY = '1.1';
	const DEFAULT_TEMPERATURE = '0.8';
	const DEFAULT_SEED = '0';
	const DEFAULT_STOP = '\\n';
	const DEFAULT_TFS_Z = '1';
	const DEFAULT_NUM_PREDICT = '128';
	const DEFAULT_TOP_K = '40';
	const DEFAULT_TOP_P = '0.9';
	const DEFAULT_MIN_P = '0.05';
	const DEFAULT_NUM_BATCH = '1';
	const DEFAULT_NUM_GPU = '1';
	const DEFAULT_MAIN_GPU = '0';
	const DEFAULT_NUM_THREAD = '4';
	const DEFAULT_NUM_KEEP = '0';
	const DEFAULT_TYPICAL_P = '1.0';
	const DEFAULT_PRESENCE_PENALTY = '0';
	const DEFAULT_FREQUENCY_PENALTY = '0';

	export let ollamaOptions: Writable<OllamaOptions>;

	// Stop is a `string[]` so we are hardcoding it to a single value for now
	let stop: string = '';
	$: if (stop) $ollamaOptions.stop = [stop];
</script>

<Fieldset>
	<FieldTextEditor label={$LL.systemPrompt()} value={''} />
	<div class="grid grid-cols-2 gap-3">
		<FieldInput
			name="mirostat"
			label={$LL.mirostat()}
			type="number"
			min={0}
			max={2}
			step={1}
			placeholder={DEFAULT_MIROSTAT}
			bind:value={$ollamaOptions.mirostat}
		/>
		<FieldInput
			name="mirostat_eta"
			label={$LL.mirostatEta()}
			type="number"
			step={0.01}
			placeholder={DEFAULT_MIROSTAT_ETA}
			bind:value={$ollamaOptions.mirostat_eta}
		/>
		<FieldInput
			name="mirostat_tau"
			label={$LL.mirostatTau()}
			type="number"
			step={0.1}
			placeholder={DEFAULT_MIROSTAT_TAU}
			bind:value={$ollamaOptions.mirostat_tau}
		/>
		<FieldInput
			name="num_ctx"
			label={$LL.numCtx()}
			type="number"
			min={1}
			step={1}
			placeholder={DEFAULT_NUM_CTX}
			bind:value={$ollamaOptions.num_ctx}
		/>
		<FieldInput
			name="repeat_last_n"
			label={$LL.repeatLastN()}
			type="number"
			min={-1}
			step={1}
			placeholder={DEFAULT_REPEAT_LAST_N}
			bind:value={$ollamaOptions.repeat_last_n}
		/>
		<FieldInput
			name="repeat_penalty"
			label={$LL.repeatPenalty()}
			type="number"
			step={0.1}
			placeholder={DEFAULT_REPEAT_PENALTY}
			bind:value={$ollamaOptions.repeat_penalty}
		/>
		<FieldInput
			name="temperature"
			label={$LL.temperature()}
			type="number"
			min={0}
			max={2}
			step={0.1}
			placeholder={DEFAULT_TEMPERATURE}
			bind:value={$ollamaOptions.temperature}
		/>
		<FieldInput
			name="seed"
			label={$LL.seed()}
			type="number"
			min={0}
			step={1}
			placeholder={DEFAULT_SEED}
			bind:value={$ollamaOptions.seed}
		/>
		<FieldInput
			name="stop"
			label={$LL.stop()}
			type="text"
			placeholder={DEFAULT_STOP}
			bind:value={stop}
		/>
		<FieldInput
			name="tfs_z"
			label={$LL.tfsZ()}
			type="number"
			min={1}
			step={0.1}
			placeholder={DEFAULT_TFS_Z}
			bind:value={$ollamaOptions.tfs_z}
		/>
		<FieldInput
			name="num_predict"
			label={$LL.numPredict()}
			type="number"
			min={-2}
			step={1}
			placeholder={DEFAULT_NUM_PREDICT}
			bind:value={$ollamaOptions.num_predict}
		/>
		<FieldInput
			name="top_k"
			label={$LL.topK()}
			type="number"
			min={1}
			step={1}
			placeholder={DEFAULT_TOP_K}
			bind:value={$ollamaOptions.top_k}
		/>
		<FieldInput
			name="top_p"
			label={$LL.topP()}
			type="number"
			min={0}
			max={1}
			step={0.05}
			placeholder={DEFAULT_TOP_P}
			bind:value={$ollamaOptions.top_p}
		/>
		<FieldInput
			name="min_p"
			label={$LL.minP()}
			type="number"
			min={0}
			max={1}
			step={0.01}
			placeholder={DEFAULT_MIN_P}
			bind:value={$ollamaOptions.min_p}
		/>
		<FieldInput
			name="num_batch"
			label={$LL.numBatch()}
			type="number"
			min={1}
			step={1}
			placeholder={DEFAULT_NUM_BATCH}
			bind:value={$ollamaOptions.num_batch}
		/>
		<FieldInput
			name="num_gpu"
			label={$LL.numGpu()}
			type="number"
			min={0}
			step={1}
			placeholder={DEFAULT_NUM_GPU}
			bind:value={$ollamaOptions.num_gpu}
		/>
		<FieldInput
			name="main_gpu"
			label={$LL.mainGpu()}
			type="number"
			min={0}
			step={1}
			placeholder={DEFAULT_MAIN_GPU}
			bind:value={$ollamaOptions.main_gpu}
		/>
		<FieldInput
			name="num_thread"
			label={$LL.numThread()}
			type="number"
			min={1}
			step={1}
			placeholder={DEFAULT_NUM_THREAD}
			bind:value={$ollamaOptions.num_thread}
		/>
		<FieldInput
			name="num_keep"
			label={$LL.numKeep()}
			type="number"
			min={0}
			step={1}
			placeholder={DEFAULT_NUM_KEEP}
			bind:value={$ollamaOptions.num_keep}
		/>
		<FieldInput
			name="typical_p"
			label={$LL.typicalP()}
			type="number"
			min={0}
			max={1}
			step={0.01}
			placeholder={DEFAULT_TYPICAL_P}
			bind:value={$ollamaOptions.typical_p}
		/>
		<FieldInput
			name="presence_penalty"
			label={$LL.presencePenalty()}
			type="number"
			step={0.01}
			placeholder={DEFAULT_PRESENCE_PENALTY}
			bind:value={$ollamaOptions.presence_penalty}
		/>
		<FieldInput
			name="frequency_penalty"
			label={$LL.frequencyPenalty()}
			type="number"
			step={0.01}
			placeholder={DEFAULT_FREQUENCY_PENALTY}
			bind:value={$ollamaOptions.frequency_penalty}
		/>
	</div>

	<div class="grid grid-cols-2 gap-3">
		<label class="field-checkbox__label">
			<input type="checkbox" bind:checked={$ollamaOptions.numa} class="field-checkbox__input" />
			{$LL.numa()}
		</label>

		<label class="field-checkbox__label">
			<input type="checkbox" bind:checked={$ollamaOptions.low_vram} class="field-checkbox__input" />
			{$LL.lowVram()}
		</label>

		<label class="field-checkbox__label">
			<input type="checkbox" bind:checked={$ollamaOptions.f16_kv} class="field-checkbox__input" />
			{$LL.f16Kv()}
		</label>

		<label class="field-checkbox__label">
			<input
				type="checkbox"
				bind:checked={$ollamaOptions.logits_all}
				class="field-checkbox__input"
			/>
			{$LL.logitsAll()}
		</label>

		<label class="field-checkbox__label">
			<input
				type="checkbox"
				bind:checked={$ollamaOptions.vocab_only}
				class="field-checkbox__input"
			/>
			{$LL.vocabOnly()}
		</label>

		<label class="field-checkbox__label">
			<input type="checkbox" bind:checked={$ollamaOptions.use_mmap} class="field-checkbox__input" />
			{$LL.useMmap()}
		</label>

		<label class="field-checkbox__label">
			<input
				type="checkbox"
				bind:checked={$ollamaOptions.use_mlock}
				class="field-checkbox__input"
			/>
			{$LL.useMlock()}
		</label>

		<label class="field-checkbox__label">
			<input
				type="checkbox"
				bind:checked={$ollamaOptions.embedding_only}
				class="field-checkbox__input"
			/>
			{$LL.embeddingOnly()}
		</label>

		<label class="field-checkbox__label">
			<input
				type="checkbox"
				bind:checked={$ollamaOptions.penalize_newline}
				class="field-checkbox__input"
			/>
			{$LL.penalizeNewline()}
		</label>
	</div>
</Fieldset>

<style lang="postcss">
	.field-checkbox__label {
		@apply inline-flex items-center gap-x-2 rounded-md border border-shade-4 px-3 py-2 text-sm leading-tight;
		@apply hover:border-shade-6 hover:text-active;
	}

	.field-checkbox__input {
		@apply accent-accent;
	}
</style>
