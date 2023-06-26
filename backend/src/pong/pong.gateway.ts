import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketGateway } from '../websocket/websocket.gateway';
import { PongGame } from './pong.class';

type Input = {
  clientId: string;
  stateId: number;
  idDelta: number;
  up: boolean;
  down: boolean;
  clientTime: number;
  serverTime: number;
};

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
  },
})
export class PongGateway extends SocketGateway {
  private games: Map<string, PongGame> = new Map();
  // private rooms: Map<string, { room: string; index: number }> = new Map(); // map clientid and room

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() data: number) {
    client?.emit('ping', [data, Date.now()]);
  }

  @SubscribeMessage('enter-room')
  handleRoom(client: Socket) {
    const { room, index } = this.webSocketService.getClientRoom(client.id);
    client.join(room);
    if (!this.games.has(room)) {
      const game = new PongGame(this.server, room);
      this.games.set(room, game);
    }
    if (index === 0) {
      this.games.get(room).setPlayer1(client);
      const p1 = this.webSocketService.getClientId(client);
      this.webSocketService.setStatus(p1, 'in-game');
      client.emit('index', 0);
    } else if (index === 1) {
      this.games.get(room).setPlayer2(client);
      const p2 = this.webSocketService.getClientId(client);
      this.webSocketService.setStatus(p2, 'in-game');
      client.emit('index', 1);
    }
  }

  @SubscribeMessage('spectate')
  handleSpecate(client: Socket, data: { friendId: number }) {
    console.log('spectate', data);
    const friend = this.webSocketService.getSocket(data.friendId);
    client.emit('enter-room', {
      room: this.webSocketService.getClientRoom(friend.id).room,
      index: 2,
    });
  }

  @SubscribeMessage('input')
  handleInput(client: Socket, input: Input) {
    const room = this.webSocketService.getClientRoom(client.id)?.room;
    if (room === undefined) return;
    const game = this.games.get(room);
    if (game) game.handleInput(input);
  }

  gameEnd(game: PongGame) {
    const p1 = this.webSocketService.getClientId(game.getPlayer1());
    const p2 = this.webSocketService.getClientId(game.getPlayer2());
    if (p1 && p2) {
      this.webSocketService.setStatus(p1, 'online');
      this.webSocketService.setStatus(p2, 'online');
    } else {
      console.log('players not found');
    }
  }

  async updateStat(
    game: PongGame,
    client: Socket,
    data: { room: string; index: number },
    result: number,
  ) {
    const winner = await this.userService.getUserById(
      this.webSocketService.getClientId(client),
    );
    const opponent = data.index === 0 ? game.getPlayer2() : game.getPlayer1();
    const loser = await this.userService.getUserById(
      this.webSocketService.getClientId(opponent),
    );
    await this.statService.updateStat(winner.id, {
      result: result,
      opponentName: loser.username,
    });
  }

  // @SubscribeMessage('leave-room')
  // async handleLeaveRoom(client: Socket, data: { room: string; index: number }) {
  //   const game = this.games.get(data.room);
  //   if (game) {
  //     if (data.index === 0 || data.index === 1) {
  //       this.rooms.delete(client.id);
  //       await this.gameEnd(game);
  //       this.games.delete(data.room);
  //       const result = data.index === 0 ? 1 : 0;
  //       this.server.to(data.room).emit('game-over', result);
  //       this.updateStat(game, client, data, result);
  //     }
  //   }
  //   client.leave(data.room);
  // }

  @SubscribeMessage('disconnect')
  async handleDisconnect(client: Socket) {
    if (this.webSocketService.getClientRoom(client.id) === undefined) return;
    const { room, index } = this.webSocketService.getClientRoom(client.id);
    const game = this.games.get(room);
    if (game) {
      if (index === 0 || index === 1) {
        this.webSocketService.removeClientRoom(client.id);
        this.gameEnd(game);
        this.games.delete(room);
        const result = index === 0 ? 1 : 0;
        await this.updateStat(game, client, { room, index }, result);
        this.server.to(room).emit('game-over', result);
      }
    }
    client.leave(room);
  }
}
