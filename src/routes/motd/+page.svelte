<script lang="ts">
	import Head from '$lib/components/Head.svelte';
	import Markdown from '$lib/components/Markdown.svelte';

	export let data: { motd: string };
</script>

<Head title="Message of the day" />

<section class="motd">
	<div class="motd__container">
		<Markdown markdown={data.motd} />
	</div>
</section>

<style lang="postcss">
	.motd {
		@apply base-section flex border-spacing-1 flex-col bg-shade-1 p-8;
	}

	.motd__container {
		@apply mx-auto my-auto;
	}
</style>
