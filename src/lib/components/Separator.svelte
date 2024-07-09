<script lang="ts">
	export let orientation: 'horizontal' | 'vertical' | undefined = 'horizontal';
</script>

<hr class="hr hr--{orientation}" {...$$restProps}>

<style lang="scss">
	.hr {
		@apply shrink-0 m-0;

		&--horizontal {
			@apply w-full h-[1px];
		}

		&--vertical {
			@apply h-full w-[1px];
		}
	}
</style>
