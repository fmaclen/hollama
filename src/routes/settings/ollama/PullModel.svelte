<script lang="ts">
	import { CloudDownload } from 'lucide-svelte';
	import type { ErrorResponse, ProgressResponse, StatusResponse } from 'ollama/browser';
	import { toast } from 'svelte-sonner';

	import LL from '$i18n/i18n-svelte';
	import { OllamaStrategy } from '$lib/chat/ollama';
	import Button from '$lib/components/Button.svelte';
	import FieldHelp from '$lib/components/FieldHelp.svelte';
	import FieldInput from '$lib/components/FieldInput.svelte';
	import P from '$lib/components/P.svelte';
	import type { Server } from '$lib/connections';

	interface Props {
		server: Server;
	}

	let { server }: Props = $props();
	let modelTag: string | undefined = $state();
	let isPullInProgress = $state(false);

	const strategy = new OllamaStrategy(server);

	async function pullModel() {
		if (!modelTag) return;
		isPullInProgress = true;
		const toastId = toast.loading($LL.pullingModel(), { description: modelTag });

		try {
			await strategy.pull(
				{ model: modelTag, stream: true },
				(response: ProgressResponse | StatusResponse | ErrorResponse) => {
					if ('status' in response && response.status === 'success') {
						toast.success($LL.success(), {
							id: toastId,
							// HACK: `modelTag` is inferred as `string | undefined`
							// but it should be a `string` based on the guard clause above
							description: $LL.modelWasDownloaded({ model: modelTag as string })
						});
						modelTag = '';
						return;
					}

					if ('error' in response) {
						toast.error($LL.genericError(), { id: toastId, description: response.error });
						return;
					}

					if ('completed' in response && 'total' in response) {
						const progress = (response.completed / response.total) * 100;
						toast.loading(response.status, {
							id: toastId,
							description: `${progress.toFixed(0)}%`
						});
					}
				}
			);
			await strategy.getModels();
		} catch (error) {
			const typedError = error instanceof Error ? error : new Error(String(error));

			toast.error($LL.genericError(), {
				id: toastId,
				description:
					typedError.message === 'Failed to fetch'
						? $LL.couldntConnectToOllamaServer()
						: typedError.message
			});
		}
		isPullInProgress = false;
	}
</script>

<FieldInput
	name={`pull-model-${server.id}`}
	label={$LL.pullModel()}
	placeholder={$LL.pullModelPlaceholder()}
	bind:value={modelTag}
	disabled={isPullInProgress || !server.isVerified}
>
	<svelte:fragment slot="nav">
		<Button
			aria-label={$LL.downloadModel()}
			class="h-full text-muted"
			isLoading={isPullInProgress}
			disabled={!modelTag || isPullInProgress || !server.isVerified}
			on:click={pullModel}
		>
			<CloudDownload class="base-icon" />
		</Button>
	</svelte:fragment>
	<svelte:fragment slot="help">
		<FieldHelp>
			<P>
				{$LL.browseModels()}
				<Button href="https://ollama.com/library" variant="link" target="_blank">
					{$LL.ollamaLibrary()}
				</Button>
			</P>
		</FieldHelp>
	</svelte:fragment>
</FieldInput>
