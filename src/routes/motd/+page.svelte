<script lang="ts">
	import i18n from '$lib/i18n';

	import Head from '$lib/components/Head.svelte';
	import Markdown from '$lib/components/Markdown.svelte';

	export let data: { motd: string };
</script>

<Head title={$i18n.t('messageOfTheDay')} />

<section class="motd">
	<div class="motd__container">
		<Markdown markdown={data.motd} />
	</div>
</section>

<style lang="postcss">
	.motd {
		@apply base-section flex border-spacing-1 flex-col bg-shade-1 scrollbar scrollbar-thumb-[#242424] scrollbar-track-[#4d4d4d] p-8;
	}

	.motd__container {
		@apply mx-auto my-auto;
	}
</style>
