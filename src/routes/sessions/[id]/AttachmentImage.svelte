<script lang="ts">
	interface Props {
		dataUrl: string;
		name: string;
	}
	let { dataUrl, name }: Props = $props();
</script>

<div
	class="mr-2 flex w-full items-center gap-x-2 overflow-hidden text-ellipsis whitespace-nowrap rounded-md border p-1"
>
	<img
		src={dataUrl}
		alt={name}
		class="h-8 w-8 rounded-sm object-cover"
		data-testid="attachment-image-preview"
	/>
	<span class="text-xs text-neutral-500" data-testid="attachment-image-name">{name}</span>
</div>
