<script lang="ts">
	import ButtonNew from './ButtonNew.svelte';
	import SectionList from './SectionList.svelte';
	import Separator from './Separator.svelte';
	import type { Sitemap } from '$lib/sitemap';

	export let sitemap: Sitemap;
</script>

<section class="entity">
	<aside class="entity__aside">
		<ButtonNew sitemap={sitemap}></ButtonNew>

		<Separator />

		<SectionList>
			<slot name="list-items" />
		</SectionList>
	</aside>

	<Separator orientation="vertical" />

	<slot />
</section>

<style lang="scss">
	.entity {
		@apply grid grid-cols-[1fr,max-content,4fr] bg-elevation-100 h-full overflow-y-auto;

		&__aside {
			@apply flex h-full min-w-80 flex-col bg-elevation-0;
		}
	}
</style>
