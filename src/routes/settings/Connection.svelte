<script lang="ts">
	import { LoaderCircle } from 'lucide-svelte';
	import Trash_2 from 'lucide-svelte/icons/trash-2';
	import { toast } from 'svelte-sonner';

	import LL from '$i18n/i18n-svelte';
	import { OllamaStrategy } from '$lib/chat/ollama';
	import { OpenAIStrategy } from '$lib/chat/openai';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import FieldCheckbox from '$lib/components/FieldCheckbox.svelte';
	import FieldHelp from '$lib/components/FieldHelp.svelte';
	import FieldInput from '$lib/components/FieldInput.svelte';
	import Fieldset from '$lib/components/Fieldset.svelte';
	import P from '$lib/components/P.svelte';
	import { ConnectionType, type Server } from '$lib/connections';
	import { serversStore } from '$lib/localStorage';

	import OllamaBaseURLHelp from './ollama/BaseURLHelp.svelte';
	import PullModel from './ollama/PullModel.svelte';

	interface Props {
		index: number;
	}

	let { index }: Props = $props();
	let server: Server = $state($serversStore[index]);
	let strategy: OllamaStrategy | OpenAIStrategy;
	let isLoading = $state(false);

	const isOpenAiFamily = $derived(
		[ConnectionType.OpenAI, ConnectionType.OpenAICompatible].includes(server.connectionType)
	);
	const isOllamaFamily = $derived([ConnectionType.Ollama].includes(server.connectionType));

	$effect(() => {
		serversStore.update((servers) => {
			servers.splice(index, 1, server);
			return servers;
		});
	});

	async function verifyServer() {
		isLoading = true;
		const toastId = toast.loading($LL.connecting());

		strategy = isOpenAiFamily ? new OpenAIStrategy(server) : new OllamaStrategy(server);
		server.isVerified = (await strategy.verifyServer()) ? new Date() : null;

		if (server.isVerified) {
			server.isEnabled = true;
			toast.success($LL.connectionIsVerified(), { id: toastId });
		} else {
			toast.error($LL.connectionFailedToVerify(), { id: toastId });
		}
		isLoading = false;
	}

	function deleteServer() {
		serversStore.update((servers) => servers.filter((s) => s.id !== server.id));
	}
</script>

<div data-testid="server">
	<Fieldset>
		{#snippet legend()}
			{#if [ConnectionType.OpenAI, ConnectionType.Ollama].includes(server.connectionType)}
				<Badge
					variant={server.connectionType === ConnectionType.OpenAI
						? ConnectionType.OpenAI
						: ConnectionType.Ollama}
				/>
			{/if}
			<Badge>{server.label ? server.label : server.connectionType?.toUpperCase()}</Badge>
		{/snippet}

		<Fieldset>
			<nav class="flex items-stretch gap-x-2">
				<FieldCheckbox label={$LL.useModelsFromThisServer()} bind:checked={server.isEnabled} />

				<Button
					class="max-h-full"
					variant="outline"
					on:click={deleteServer}
					aria-label={$LL.deleteServer()}
				>
					<Trash_2 class="base-icon" />
				</Button>

				<Button
					disabled={isLoading || !server.baseUrl}
					variant={!server.isVerified ? 'default' : 'outline'}
					on:click={verifyServer}
				>
					{#if isLoading}
						<LoaderCircle class="base-icon animate-spin" />
					{:else}
						{server.isVerified ? $LL.reVerify() : $LL.verify()}
					{/if}
				</Button>
			</nav>

			<div class="flex flex-col gap-2 sm:grid sm:grid-cols-2">
				<div class="col-span-2 grid gap-2 {isOpenAiFamily ? 'sm:grid sm:grid-cols-2' : ''}">
					<FieldInput
						name={`server-${server.id}`}
						label={$LL.baseUrl()}
						placeholder={server.baseUrl}
						bind:value={server.baseUrl}
					>
						<svelte:fragment slot="help">
							{#if isOllamaFamily}
								<OllamaBaseURLHelp {server} />
							{/if}
						</svelte:fragment>
					</FieldInput>

					{#if isOpenAiFamily}
						<FieldInput
							type="password"
							name={`apiKey-${server.id}`}
							label={$LL.apiKey()}
							bind:value={server.apiKey}
						>
							<svelte:fragment slot="help">
								{#if server.connectionType === 'openai'}
									<FieldHelp>
										<P>
											<Button
												variant="link"
												href="https://help.openai.com/en/articles/4936850-where-do-i-find-my-openai-api-key"
												target="_blank"
											>
												{$LL.howToObtainOpenAIKey()}
											</Button>
										</P>
									</FieldHelp>
								{/if}
							</svelte:fragment>
						</FieldInput>
					{/if}
				</div>
				<FieldInput
					name={`modelsFilter-${server.id}`}
					label={$LL.modelsFilter()}
					placeholder="gpt"
					bind:value={server.modelFilter}
				>
					<svelte:fragment slot="help">
						<FieldHelp>
							<P>
								{$LL.modelsFilterHelp()}
							</P>
						</FieldHelp>
					</svelte:fragment>
				</FieldInput>

				<FieldInput
					name={`label-${server.id}`}
					label={$LL.label()}
					bind:value={server.label}
					placeholder="my-llama-server"
				>
					<svelte:fragment slot="help">
						<FieldHelp>
							<P>{$LL.connectionLabelHelp()}</P>
						</FieldHelp>
					</svelte:fragment>
				</FieldInput>
			</div>

			{#if isOllamaFamily}
				<PullModel {server} />
			{/if}
		</Fieldset>
	</Fieldset>
</div>
