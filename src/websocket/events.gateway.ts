// src/websocket/events.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'events',
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  // Клиент заходит на страницу события
  @SubscribeMessage('joinEvent')
  handleJoin(
    @MessageBody() typeEventId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(typeEventId);
    console.log(`Client ${client.id} joined ${typeEventId}`);
  }

  @SubscribeMessage('leaveEvent')
  handleLeave(
    @MessageBody() typeEventId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(typeEventId);
  }

  // Метод, который будем вызывать из сервиса
  emitVotesUpdated(typeEventId: string, data: any) {
    this.server.to(typeEventId).emit('votesUpdated', data);
  }

  emitResultAnnounced(typeEventId: string, result: number) {
    this.server.to(typeEventId).emit('resultAnnounced', { result });
  }
}