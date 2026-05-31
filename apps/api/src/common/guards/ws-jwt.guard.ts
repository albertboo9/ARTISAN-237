import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      // Token peut venir des headers ou du payload
      const authHeader = client.handshake.headers.authorization;
      if (!authHeader) {
        throw new WsException('Missing authorization header');
      }

      const token = authHeader.split(' ')[1];
      const payload = this.jwtService.verify(token);
      
      // Inject user payload into socket client object for next steps
      (client as any).user = payload;
      
      return true;
    } catch (err) {
      throw new WsException('Invalid credentials');
    }
  }
}
