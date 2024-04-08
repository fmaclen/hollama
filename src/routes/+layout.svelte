<script lang="ts">
	import '../app.pcss';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
</script>

<Resizable.PaneGroup direction="horizontal" class="h-screen w-screen">
	<Resizable.Pane minSize={15} maxSize={50} class="h-screen">
		<a href="/" title="Main menu">
			<img class="" src="/favicon.png" alt="Hollama logo" width="56" height="56" />
		</a>
	</Resizable.Pane>
	<Resizable.Handle />
	<slot />
</Resizable.PaneGroup>
