<script lang="ts">
	import ButtonNew from './ButtonNew.svelte';
	import SectionList from './SectionList.svelte';
	import type { Sitemap } from '$lib/sitemap';
	import { page } from '$app/stores';

	export let sitemap: Sitemap;
	$: isIndex = `/${sitemap}` === $page.url.pathname;
</script>

<section class="section {isIndex ? 'section--index' : ''}">
	<aside class="section__aside">
		<ButtonNew {sitemap}></ButtonNew>
		<SectionList>
			<slot name="list-items" />
		</SectionList>
	</aside>

	<div class="section__content">
		<slot />
	</div>
</section>

<style lang="scss">
	@import '$lib/mixins.scss';

	.section {
		@include base-section;
		@apply grid grid-flow-row;
		@apply lg:grid-cols-[1fr,4fr];
	}

	.section__aside {
		@apply flex h-full min-w-80 flex-col overflow-y-auto border-r;
	}

	.section--index {
		.section__aside {
			@apply flex;
		}

		.section__content {
			@apply hidden;
			@apply lg:block;
		}
	}

	.section:not(.section--index) {
		.section__aside {
			@apply hidden;
			@apply lg:flex;
		}

		.section__content {
			@apply block;
		}
	}
</style>
