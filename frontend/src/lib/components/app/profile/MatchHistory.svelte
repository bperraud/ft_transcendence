<script lang="ts">
	import { Context } from '$lib/components/Context.svelte';
	import { writable } from 'svelte/store';
	import { user } from '$lib/stores';

	export let userId: number | null = null;

	const fetchWithToken = Context.fetchWithToken();
	let current: Context.Match | null = null;
	let currentHistory = writable<Context.Match[]>();

	async function fetchHistory(id : number | null) {
		const res = await fetchWithToken(`stat/get-history/${id}`);
		const data = await res.json();
		data.forEach(function (element: any, index: number) {
			const createdAtDate = new Date(element.createdAt);
			data[index] = {
				result: id === element.winnerId ? 'Win' : 'Lose',
				opponent: element.username,
				createdAt: createdAtDate.toLocaleDateString('en', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric'
				})
			};
		});
		return data;
	}

	async function updateHistory() {
		$currentHistory = await fetchHistory(userId);
	}

	$:  {
		if (userId === null) {
			userId = $user.id;
		}
		updateHistory();
	}
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
