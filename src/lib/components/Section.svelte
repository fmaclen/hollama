<script lang="ts">
	import { page } from '$app/stores';
	import type { Sitemap } from '$lib/sitemap';

	import ButtonNew from './ButtonNew.svelte';
	import SectionList from './SectionList.svelte';

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

<style lang="postcss">
	.section {
		@apply base-section;
		@apply grid grid-flow-row;
		@apply lg:grid-cols-[1fr,4fr];
	}

	.section__aside {
		@apply overflow-scrollbar flex h-full min-w-80 flex-col border-r;
	}

	.section__content {
		@apply overflow-scrollbar flex h-full flex-col bg-shade-1;
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
