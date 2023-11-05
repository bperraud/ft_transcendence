<script lang="ts">
	import { createEventDispatcher, afterUpdate, beforeUpdate, onMount } from 'svelte';
	import { PUBLIC_WEBSERV_URL } from '$env/static/public';
	import { user } from '$lib/stores';
	import DropDown from '$lib/components/drop/DropDown.svelte';


	const gameSocket = new WebSocket('ws://localhost:8080');
	gameSocket.send("hello world");


</script>

<div class="window-body">

</div>

<style lang="scss">

</style>
