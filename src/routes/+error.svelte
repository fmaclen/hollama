<script>
	import { page } from '$app/stores';
</script>

<h1>{$page.status}: {$page.error.message}</h1>

{#if $page.status === 404}
	<p>The page you are looking for does not exist.</p>
{/if}
{#if $page.status === 500}
	<p>There was an internal server error. Please try again later.</p>
{/if}

<a href="/">Go to Home</a>
