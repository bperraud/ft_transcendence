<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';
	import { writable } from 'svelte/store';
	import { user } from '$lib/stores';
	import { onMount } from 'svelte';

	export let userId: number | null = null;

	const fetchWithToken = Context.fetchWithToken();
	let current: Context.Match | null = null;
	let currentHistory = writable<Context.Match[]>();
	const contextUpdateHistory = Context.updateStat();

	async function fetchHistory() {
		const res = await fetchWithToken(`stat/get-history/${userId}`);
		const data = await res.json();
		const updatedData = data.map((element : any) => {
			const createdAtDate = new Date(element.createdAt);
			return {
				...element,
				createdAt: createdAtDate.toLocaleDateString('en', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric'
				})
			};
		});
		return updatedData;
	}

	contextUpdateHistory.subscribe(() => {
		fetchHistory().then(data => {
			$currentHistory = data;
		});
	});

	onMount(() => {
		if (userId === null) userId = $user.id;
		fetchHistory().then(data => {
			$currentHistory = data;
		});
	});

</script>

<div class="sunken-panel">
	{#if $currentHistory?.length === 0}
		<tr>
			<td colspan="3">You have not participated in any matches</td>
		</tr>
	{:else}
		<table class="interactive">
			<thead>
				<tr>
					<th>Result</th>
					<th>Opponent</th>
					<th>Date</th>
				</tr>
			</thead>
			<tbody>
				{#if $currentHistory !== undefined && $currentHistory !== null}
					{#each Object.values($currentHistory) as row}
						<tr
							class={current === row ? 'highlighted' : ''}
							on:click={() => (current === row ? (current = null) : (current = row))}
						>
							{#each Object.values(row) as cell}
								<td>{cell}</td>
							{/each}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	{/if}
</div>

<style lang="scss">
	@include table-95;

	.sunken-panel {
		td {
			padding: 0.3rem;
		}

		tr > * {
			width: 14rem;
		}
	}
</style>
