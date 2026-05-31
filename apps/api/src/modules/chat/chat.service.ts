import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateChatRoom(jobId: string) {
    let room = await this.prisma.chatRoom.findUnique({
      where: { jobId },
    });

    if (!room) {
      room = await this.prisma.chatRoom.create({
        data: { jobId },
      });
    }
    return room;
  }

  async saveMessage(chatRoomId: string, senderId: string, content: string, mediaUrl?: string) {
    return this.prisma.message.create({
      data: {
        chatRoomId,
        senderId,
        content,
        mediaUrl,
      },
      include: {
        sender: { select: { id: true, firstName: true, avatarUrl: true } }
      }
    });
  }

  async getMessages(jobId: string) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { jobId },
      include: {
        messages: {
          include: { sender: { select: { id: true, firstName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'asc' },
        }
      }
    });

    if (!room) throw new NotFoundException('Chat room not found');
    return room.messages;
  }
}
