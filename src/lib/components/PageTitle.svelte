<script lang="ts">
	export let title: string | string[] | undefined;
	const SEPARATOR = ' • ';
	$: formattedTitle = title
		? (Array.isArray(title) ? title.join(SEPARATOR) : title) + SEPARATOR + 'Hollama'
		: 'Hollama';
</script>

<svelte:element this={'title'}>
	{formattedTitle}
</svelte:element>
