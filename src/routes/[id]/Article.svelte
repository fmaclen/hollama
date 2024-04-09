<script lang="ts">
	import MarkdownIt from 'markdown-it';
	import { type Message } from '$lib/sessions';

	const md = new MarkdownIt();

	export let message: Message;
</script>

<article class="grid grid-cols-[max-content_auto] gap-x-6">
	<p class="
		text-xs
		text-neutral-900
		text-center
		font-bold
		leading-7
		uppercase
		w-[6ch]
	">
		{message.role === 'user' ? 'You' : message.role}
	</p>
	<div class="
		overflow-x-auto text-md

		[&>pre>code]:block
		[&>pre>code]:opacity-75
		[&>pre>code]:overflow-y-auto
		[&>pre>code]:bg-gray-300
		[&>pre>code]:rounded-md
		[&>pre>code]:text-sm
		[&>pre>code]:p-4
		[&>pre:not(:first-child,:last-child)>code]:my-4
		
		[&>p]:max-w-[60ch]
		[&>p:not(:first-child,:last-child)]:my-4
		[&>ul]:max-w-[60ch]
		[&>ul]:my-4
		[&>ul]:flex
		[&>ul]:flex-col
		[&>ul]:gap-y-1
		[&>ul]:list-inside
		[&>ul]:list-disc

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

