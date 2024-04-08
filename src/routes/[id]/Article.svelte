<script lang="ts">
	import MarkdownIt from 'markdown-it';
	import { type Message } from '$lib/sessions';

	const md = new MarkdownIt();

	export let message: Message;
</script>

<article class="grid grid-cols-[1fr_11fr] gap-x-4">
	<p class="text-xs leading-7 font-semibold uppercase">{message.role}</p>
	<div class="
		w-full overflow-x-auto text-lg

		[&>pre>code]:block
		[&>pre>code]:opacity-75
		[&>pre>code]:overflow-y-auto
		[&>pre>code]:bg-gray-300
		[&>pre>code]:rounded-md
		[&>pre>code]:text-sm
		[&>pre>code]:p-4
		[&>pre>code]:my-4
		
		[&>p>code]:opacity-75
		[&>p>code]:bg-gray-300
		[&>p>code]:rounded-md
		[&>p>code]:text-sm
		[&>p>code]:p-1
		[&>p>code]:my-4
	">
		{@html md.render(message.content)}
	</div>
</article>

