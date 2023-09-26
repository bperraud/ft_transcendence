<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { Context } from '$lib/components/Context.svelte';
	import { user } from '$lib/stores';
	import { writable } from 'svelte/store';

	const socket = Context.socket();
	const blocks = Context.blocks();
	const selected = Context.selected();
	const addInstance = Context.addInstance();
	const fetchUpdateLastMessageRead = Context.fetchUpdateLastMessageRead();
	const fetchConversationById = Context.fetchConversationById();

	let chatIdLocal: number ;
	let currentChat = writable<Context.Message[]>([]);
	let messageContent = '';
	let chatWindow: HTMLDivElement;
	let autoScroll = true;
	let blockedIds: number[];
	let noMember = false;

	export let chatId: number;

	$: {
		blockedIds = $blocks.map((block) => block.blockedId);
		chatIdLocal = chatId;
		$currentChat;
	}

	onMount(() => {
		$socket.on('updateChat', (chatId: number) => {
			if (chatIdLocal === null || chatIdLocal === undefined) chatIdLocal = chatId;
		});
		$socket.on('updateGroupChat', () => {
			noMember = true;
		});
		$socket.on('message', (data: { chatId: number; message: Context.Message }) => {
			if (chatIdLocal === data.chatId) {
				currentChat.update((chatMessages) => [...chatMessages, data.message]);
			}
		});
		$socket.emit('joinRoom', { chatId: chatIdLocal });
		updateLastMessageRead();
	});

	afterUpdate(() => {
		if (autoScroll) chatWindow.scrollTop = chatWindow.scrollHeight;
	});

	function openProfile(userId: number) {
		addInstance('Profile', { userId: userId }, { userId: userId });
		$selected = null;
	}

	function handleScroll() {
		autoScroll = chatWindow.scrollTop + chatWindow.clientHeight + 1 >= chatWindow.scrollHeight;
	}

	async function handleClick(event: any) {
		if (event.button === 0) updateLastMessageRead();
	}

	async function updateLastMessageRead() {
		//const lastMessage = currentChat?.messages[currentChat?.messages.length - 1];
		//if (lastMessage && lastMessage.userId !== $user?.id) {
		//	const chatUser = currentChat.chatUsers.find((user: any) => user.userId === userId);
		//	if (chatIdLocal && lastMessage.id !== chatUser.lastReadMessageId && $user?.id) {
		//		await fetchUpdateLastMessageRead(chatIdLocal, lastMessage.id, $user?.id);
		//		currentChat.chatUsers.find((user: any) => user.userId === userId).lastReadMessageId =
		//			lastMessage.id;
		//	}
		//}
	}

	async function sendMessage() {
		if (messageContent.trim() === '') return;
		$socket.emit('sendMessage', {
			chatId: chatIdLocal,
			userId: $user?.id,
			content: messageContent,
		});
		messageContent = '';
	}

	const formatter = new Intl.DateTimeFormat('en', {
		hour12: false,
		hour: 'numeric',
		minute: '2-digit'
	});

	(async () => {
		$currentChat = await fetchConversationById(chatId);
	})();

</script>

<div id="box" on:click={handleClick}>
	<div id="chat-window" bind:this={chatWindow} on:scroll={handleScroll}>
		{#if !$currentChat.length}
			<h5>Waiting for messages...</h5>
		{:else}
			<h5>▪ End of messages ▪</h5>
		{/if}
		<ul>
			{#if $currentChat}
				{#each $currentChat as message, i (i)}
					{#if !blockedIds.includes(message.senderId)}
						<li class={message.senderId === $user?.id ? 'self' : 'other'}>
							<div class="message-header">
								{#if (i === 0 || $currentChat[i - 1].senderId !== message.senderId) && message.senderId !== $user?.id}
									<strong on:click={() => openProfile(message.senderId)}
										>{message.senderName}</strong>
								{/if}
							</div>
							<div class="message-content">{message.content}</div>
							<h6 class="clock">
								{#if (i !== $currentChat.length - 1
									&& formatter.format(new Date($currentChat[i + 1].createdAt)) !== formatter.format(new Date($currentChat[i].createdAt)))
									|| i === $currentChat.length - 1}
									{formatter.format(new Date(message.createdAt))}
								{/if}
							</h6>
						</li>
					{/if}
				{/each}
			{/if}
		</ul>
	</div>
	<div id="sendMessage-window">
		<!--{#if isFriend && !noMember}-->
		{#if true}
			<form on:submit|preventDefault={sendMessage} class="send-message-form">
				<input type="text" bind:value={messageContent} class="message-input" autocomplete="off" />
				<button type="submit" class="btn send-btn">Send</button>
			</form>
		{:else}
			<p>You can't talk with this chat</p>
		{/if}
	</div>
</div>

<style lang="scss">
	#box {
		width: 20rem;
		height: 25rem;
	}

	#chat-window {
		height: 90%;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 0.5rem;
		margin: 0.25rem;
		margin-bottom: 0.15rem;
		@include tab-border($light-grey, $dark-grey);
	}

	#sendMessage-window {
		padding: 0.2rem 0.25rem 0.4rem 0.25rem;
	}

	.btn {
		padding: 0.1rem 0.4rem;
	}

	.send-btn {
		@include button-95;
		margin-left: auto;
		order: 2;
	}

	h5 {
		margin: 0.2rem 0 0 0;
		text-align: center;
		color: $dark-grey;
	}

	input[type='text'].message-input {
		@include tab-border(white, black);
		background-color: white;
		width: 100%;
		padding: 0.3rem;
		box-sizing: border-box;
		margin-right: 0.5rem;
		order: 1;
		outline: none;
	}

	ul {
		list-style: none;
		display: flex;
		flex-direction: column;
	}

	li {
		margin-bottom: 0.25rem;
		word-break: break-word;
		display: flex;
		flex-direction: column;
	}

	li.other {
		h6 {
			margin-top: 0.2rem;
			margin-right: auto;
		}
	}

	li.self {
		h6 {
			margin-top: 0.2rem;
			margin-left: auto;
		}
	}

	li.self .message-header {
		strong {
			cursor: url($click), auto;
		}
		color: white;
	}

	li.self .message-header,
	li.self .message-content {
		margin-top: 0.1rem;
		align-self: flex-end;
		display: flex;
		justify-content: flex-end;
		width: 80%;
	}

	li.other .message-header {
		strong {
			cursor: url($click), auto;
		}
		color: $blue;
	}

	li.other .message-header,
	li.other .message-content {
		margin-top: 0.1rem;
		align-self: flex-start;
		display: flex;
		justify-content: flex-start;
		width: 80%;
	}

	.message-header {
		font-size: 0.85em;
		font-weight: bold;
		color: #242424d1;
	}

	.message-content {
		margin-top: 0.2rem;
		padding: 0.3rem 0.5rem;
		font-size: 0.9em;
		@include tab-border(white, black);
		background-color: $light-grey;
	}

	.send-message-form {
		display: flex;
		width: 100%;
	}

	p {
		font-weight: bold;
		text-align: center;
		font-size: 0.9rem;
	}
</style>
