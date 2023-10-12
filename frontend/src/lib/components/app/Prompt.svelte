<script lang="ts">
	import DropDown from '$lib/components/drop/DropDown.svelte';

	let input = '';

	let textareaValue = '';

	function clear() {
		input = '';
	}

	const WEBSERV_BACKEND_URL = 'http://localhost:8080'; // should be in .env and not on the frontend

	function fetchWithTokenWebServer(route: string, options: RequestInit = {}): Promise<Response> {
		const res = fetch(`${WEBSERV_BACKEND_URL}/${route}`,  {
			...options,
		});
		res.then((resp) => {
			console.log(resp);
		});
		return res;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			run_cmd(input);
			clear();
		}
	}

	async function run_cmd(input: string) {
		const encodedInput = encodeURIComponent(input);
		const res = await fetchWithTokenWebServer(`minishell/?${encodedInput}`, {
			method: 'GET'
		});
		const data = await res.text();
		textareaValue += data;
		console.log(data);
	}

	let activeDrop: string | null = null;

	fetchWithTokenWebServer("minishell", {
			method: 'GET'
		}).then((res) => {
			console.log(res);
		});

</script>

<div class="window-body">
	<div class="menu">
		<DropDown name="File" bind:activeDrop>
			<button on:click={clear}>New</button>
			<button class="unavailable">Save</button>
		</DropDown>
		<DropDown name="Edit" bind:activeDrop>
			<button class="unavailable">Undo</button>
		</DropDown>
	</div>
	<div class="content">
		<p>{textareaValue}</p>
		<!--<p bind:value={textareaValue} readonly/>-->
		<input type="text" bind:value={input} class="message-input" on:keydown={handleKeyDown}/>
	</div>
</div>

<style lang="scss">
	div.menu {
		display: flex;
		margin: 0 0.2rem;

		@include tab-border(white, $dark-grey);

		button:not(.unavailable) {
			@include dropdown-button;
		}

		button.unavailable {
			@include dropdown-button(false);
		}
	}

	div.content {

		margin-left: 0.2rem;
		margin-right: 0.2rem;

		p {
			font-size: 1.1rem;
			white-space: pre-line;
			min-height: 80px;
			min-width: 150px;
			padding-top: 0.2rem;
			padding-left: 0.2rem;
			outline: none;
			height: 30rem;
			width: 50rem;
			background-color: #000;
			color: white;
			overflow-y: auto;
		}

		.message-input {
			font-size: 1.1rem;
			width: 100%;
			background: none;
			background-color: #000;
			color: white;
		}

		.message-input:focus {
			outline: none;
		}

	}


</style>
