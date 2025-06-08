<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import Head from '$lib/components/Head.svelte';
	import Markdown from '$lib/components/Markdown.svelte';

	export let data: { motd: string };
</script>

<Head title={$LL.messageOfTheDay()} />

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
