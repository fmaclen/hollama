<div class="wrapper">
	<slot/>
</div>

<style>
	:root {
		--font-family: 'SF Mono', monospace;
		--color-background: #FFF;
	}

	:global(*) {
		font-family: var(--font-family);
	}

	:global(body) {
		margin: unset;
		background-color: #f4f4f4;
	}

	div.wrapper {
		max-width: 768px;
		margin-inline: auto;
	}
</style>
