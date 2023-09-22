<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { Context } from '$lib/components/Context.svelte';
	import { user } from '$lib/stores';

	const socket = Context.socket();
	const blocks = Context.blocks();
	//const chatId = Context.chatId();
	const fetchChatById = Context.fetchChatById();
	const chats = Context.chats();
	const friendInfoId = Context.friendInfoId();
	const contacts = Context.contacts();
	const selected = Context.selected();
	const addInstance = Context.addInstance();
	const fetchUpdateLastMessageRead = Context.fetchUpdateLastMessageRead();
	const fetchConversationById = Context.fetchConversationById();
	let userId = $user?.id;
	let chatIdLocal: number ;
	let currentChat: Context.Message[];
	//let currentChat: any = null;
	let friendUsername: string | null | undefined = '';
	let messageContent = '';
	let isFriend = true;
	let chatWindow: HTMLDivElement;
	let autoScroll = true;
	//let isCreatingChat = false;
	let blockedIds: number[];
	let noMember = false;
	//let friendId: number | null = $friendInfoId;
	//export let friendId: number | null = null;

	export let chatId: number;

	$: {
		blockedIds = $blocks.map((block) => block.blockedId);
		friendUsername = 'patrick' ;
		//friendUsername = $contacts.find((contact) => contact.id === friendId)?.username;
		//isFriend = friendUsername != undefined;
		//if (chatIdLocal !== null && chatIdLocal !== undefined) {
		//	currentChat = $chats.find((chat) => chat.id === chatIdLocal);
		//	if (currentChat && currentChat.isGroupChat) isFriend = true;
		//}
		//chatIdLocal = chatId;

		//currentChat = $chats.find((chat) => chat.id === chatIdLocal);
		console.log('chatIdLocal');
		console.log(chatId);
		chatIdLocal = chatId;
	}

	onMount(() => {
		$socket.on('updateChat', (chatId: number) => {
			if (chatIdLocal === null || chatIdLocal === undefined) chatIdLocal = chatId;
		});
		$socket.on('updateGroupChat', () => {
			noMember = true;
		});
		chatWindow.scrollTop = chatWindow.scrollHeight;
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
		if (chatWindow.scrollTop + chatWindow.clientHeight + 1 >= chatWindow.scrollHeight) {
			autoScroll = true;
		} else {
			autoScroll = false;
		}
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
		//if (!chatIdLocal) {
		//	const memberUsernames = [$user?.username, friendUsername];
		//	const groupName = memberUsernames.join('-');
		//	const chat = await fetchCreateChat(groupName, memberUsernames, false, 'private');
		//	const chatExists = $chats.some((existingChat) => existingChat.id === chat.id);
		//	if (!chatExists) {
		//		//$chats = [...$chats, chat];
		//		chatIdLocal = chat.id;
		//		$socket.emit('joinRoom', { chatId: chat.id });
		//		$socket.emit('otherAddChat', { chat: chat, userId: $user?.id });
		//		$socket.emit('otherAddChat', { chat: chat, userId: friendId });
		//	}
		//}
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
		currentChat = await fetchConversationById(chatId);
		console.log(currentChat);
	})();

</script>

<div id="box" on:click={handleClick}>
	<div id="chat-window" bind:this={chatWindow} on:scroll={handleScroll}>
		{#if !currentChat}
			<h5>Waiting for messages...</h5>
		{:else}
			<h5>▪ End of messages ▪</h5>
		{/if}
		<ul>
			{#if currentChat}
				{#each currentChat as message}
					{#if !blockedIds.includes(message.senderId)}
						<li class={message.senderId === $user?.id ? 'other' : 'self'}>
							<div class="message-header">
								<strong on:click={() => openProfile(message.senderId)}
										>{message.senderId === $user?.id ? friendUsername : $user?.username}</strong>
							</div>
							<div class="message-content">{message.content}</div>
							<h6 class="clock">
								{formatter.format(new Date(message.createdAt))}
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
