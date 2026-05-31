import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket, 
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../../common/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat'
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    // Le JWT devrait être validé ici ou via un Guard global pour la connection
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('jobId') jobId: string,
  ) {
    const room = await this.chatService.getOrCreateChatRoom(jobId);
    client.join(room.id);
    return { event: 'joinedRoom', data: room.id };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: any, // any to access user from guard
    @MessageBody() payload: { jobId: string, content: string, mediaUrl?: string }
  ) {
    const userId = client.user.sub;
    const room = await this.chatService.getOrCreateChatRoom(payload.jobId);
    
    const message = await this.chatService.saveMessage(
      room.id, 
      userId, 
      payload.content, 
      payload.mediaUrl
    );

    // Broadcast to everyone in the room
    this.server.to(room.id).emit('newMessage', message);
    return message;
  }
}
