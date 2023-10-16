<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';
	import { writable } from 'svelte/store';
	import { user } from '$lib/stores';
	import { onMount } from 'svelte';

	export let userId: number | null | undefined = null;

	const fetchWithToken = Context.fetchWithToken();
	let currentStatistics = writable<Context.Stat>();
	const contextUpdateStat = Context.updateStat();

	async function fetchStatistics() {
		const res = await fetchWithToken(`stat/get-stat/${userId}`);
		const data = await res.json();
		return data;
	}

	contextUpdateStat.subscribe(() => {
		fetchStatistics().then(data => {
			$currentStatistics = data;
		});
	});

	onMount(() => {
		if (userId === null) userId = $user.id;
		fetchStatistics().then(data => {
			$currentStatistics = data;
		});
	});

</script>

<div class="statistic-pic">
	{#if $currentStatistics !== undefined && $currentStatistics !== null}
		<ul class="whole-box">
			<div class="stats">
				<li class="box">Win: {$currentStatistics?.wins}</li>
				<li class="box">Loss: {$currentStatistics?.losses}</li>
				<li class="box">Elo: {$currentStatistics?.elo} ({$currentStatistics?.ladder})</li>
				<div class="ladder" id="ladder" />
			</div>
			<div class="ladder-image">
				<img src="{$currentStatistics?.ladder}.png" alt="ladder image" width="100" height="100" />
			</div>
		</ul>
	{/if}
</div>

<style lang="scss">

	li {
		list-style: none;
		padding: 0.5rem;
		margin-bottom: 0.25rem;
		width: 12rem;
		@include tab-contour-hollow;
	}

	.statistic-pic {

		.whole-box {
			display: flex;
			flex-direction: row;
		}

		.ladder-image {
			display: flex;
			justify-content: center;
			align-items: center;
			overflow: hidden;
			margin-left: 3rem;
			width: 7rem;
			height: 6.72rem;
			@include tab-border($dark-grey, $light-grey);

			img {
				position: center;
			}
		}
	}

</style>
