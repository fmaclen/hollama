<script lang="ts">
	import Head from '#lib/components/Head.svelte';
	import Markdown from '#lib/components/Markdown.svelte';
	import { m } from '#lib/paraglide/messages.js';

	export let data: { motd: string };
</script>

<Head title={m.messageOfTheDay()} />

<section class="motd">
	<div class="motd-markdown">
		<Markdown markdown={data.motd} />
	</div>
</section>

<style lang="postcss">
	.motd {
		@apply base-section base-section-fullscreen px-5;
	}

	.motd-markdown {
		@apply my-auto;

		:global(*) {
			@apply text-balance;
		}
	}
</style>
