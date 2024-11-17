<script lang="ts">
	import { onMount } from 'svelte';

	import LL from '$i18n/i18n-svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import FieldHelp from '$lib/components/FieldHelp.svelte';
	import P from '$lib/components/P.svelte';
	import type { Server } from '$lib/connections';

	interface Props {
		server: Server;
	}

	let { server }: Props = $props();

	let ollamaURL: URL | null = $state(null);

	onMount(async () => {
		// Get the current URL and set the default server
		ollamaURL = new URL(window.location.href);
		if (ollamaURL.port) {
			ollamaURL = new URL(
				`${ollamaURL.protocol}//${ollamaURL.hostname}${ollamaURL.pathname}${ollamaURL.search}${ollamaURL.hash}`
			);
		}
	});
</script>

{#if ollamaURL && !server.isVerified}
	<FieldHelp>
		<P>
			{$LL.allowConnections()}
			<Badge>{ollamaURL.origin}</Badge>
			<Button
				variant="link"
				href="https://github.com/jmorganca/ollama/blob/main/docs/faq.md#how-can-i-allow-additional-web-origins-to-access-ollama"
				target="_blank"
			>
				{$LL.seeDocs()}
			</Button>
		</P>
		<P>
			{$LL.checkBrowserExtensions()}
		</P>
		{#if ollamaURL.protocol === 'https:'}
			<P>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html $LL.tryingToConnectNotLocalhost({
					hostname: '<code class="badge">localhost</code>',
					ip: '<code class="badge">127.0.0.1</code>'
				})}
				<a
					href="https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/"
					target="_blank"
				>
					{$LL.creatingTunnel()}
				</a>
				<a
					href="https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content#loading_locally_delivered_mixed-resources"
					target="_blank"
				>
					{$LL.allowMixedContent()}
				</a>.
			</P>
		{/if}
	</FieldHelp>
{/if}
