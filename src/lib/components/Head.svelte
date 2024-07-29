<script lang="ts">
	export let title: string | string[] | undefined = undefined;
	const SEPARATOR = ' • ';
	$: formattedTitle = title
		? (Array.isArray(title) ? title.join(SEPARATOR) : title) + SEPARATOR + 'Hollama'
		: 'Hollama';
</script>

<svelte:head>
	<title>{formattedTitle}</title>
</svelte:head>
