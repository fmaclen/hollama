<script lang="ts">
	import ButtonNew from './ButtonNew.svelte';
	import SectionList from './SectionList.svelte';
	import type { Sitemap } from '$lib/sitemap';

	export let sitemap: Sitemap;
</script>

<section class="section">
	<aside class="section__aside">
		<ButtonNew {sitemap}></ButtonNew>

		<SectionList>
			<slot name="list-items" />
		</SectionList>
	</aside>

	<slot />
</section>

<style lang="scss">
	@import '$lib/mixins.scss';

	.section {
		@include base-section;
		@apply grid grid-cols-[1fr,4fr];

		&__aside {
			@apply flex h-full min-w-80 flex-col overflow-y-auto border-r;
		}
	}
</style>
