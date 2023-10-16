<script lang="ts">
	import { afterUpdate, beforeUpdate } from 'svelte';
	import { PUBLIC_WEBSERV_URL } from '$env/static/public';
	import { user } from '$lib/stores';
	import DropDown from '$lib/components/drop/DropDown.svelte';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let textAreaElem : HTMLDivElement;
	let prefix = "\\" + $user.username + " $ ";
	let input = prefix;
	let textAreaValue = '';
	let autoScroll = false;
	let activeDrop: string | null = null;

	let window : HTMLDivElement;

	function clear() {
		input = prefix;
	}

	function fetchWithTokenWebServer(route: string, options: RequestInit = {}): Promise<Response> {
		const res = fetch(`${PUBLIC_WEBSERV_URL}/${route}`,  {
			...options,
		});
		return res;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			textAreaValue += input + '\n';
			run_cmd(input.substring(prefix.length));
			clear();
		}
		else if (e.key === 'Backspace') {
			if (input.length <= prefix.length) {
				e.preventDefault();
			}
		}
		else if (e.ctrlKey && e.key === "c") {
			textAreaValue += input + '\n' + '\n';
			clear();
		}
	}

	async function run_cmd(input: string) {
		if (input.slice(0, 4) == "exit" && (input.length == 4 || input[4] == ' ')) {
			console.log("exit");
			dispatch('close');
		}

		const encodedInput = encodeURIComponent(input);
		const res = await fetchWithTokenWebServer(`minishell/?${encodedInput}`, {
			method: 'GET'
		});
		const data = await res.text();
		textAreaValue += data;
	}

	beforeUpdate(() => {
		if (textAreaElem)
			autoScroll = textAreaElem.scrollTop + textAreaElem.clientHeight + 1 >= textAreaElem.scrollHeight;
	 });

	afterUpdate(() => {
		if (autoScroll) textAreaElem.scrollTop = textAreaElem.scrollHeight;
	});

	fetchWithTokenWebServer("minishell", { method: 'GET'});

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
		<p bind:this={textAreaElem}>{textAreaValue}</p>
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
