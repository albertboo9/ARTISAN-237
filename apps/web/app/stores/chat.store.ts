import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

interface ChatState {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  activeRoom: string | null;
  rooms: { id: string; jobId: string }[];

  connect: (token: string) => void;
  disconnect: () => void;
  joinRoom: (jobId: string) => Promise<void>;
  leaveRoom: () => void;
  sendMessage: (jobId: string, content: string) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const useChatStore = create<ChatState>()((set, get) => ({
  socket: null,
  isConnected: false,
  messages: [],
  activeRoom: null,
  rooms: [],

  connect: (token: string) => {
    const socket = io(`${SOCKET_URL}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('newMessage', (message: Message) => {
      const { messages } = get();
      set({ messages: [...messages, message] });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, messages: [], activeRoom: null });
    }
  },

  joinRoom: async (jobId: string) => {
    const { socket } = get();
    if (!socket) return;

    return new Promise((resolve) => {
      socket.emit('joinRoom', { jobId }, (response: any) => {
        set({ activeRoom: response?.data || jobId });
        resolve();
      });
    });
  },

  leaveRoom: () => {
    set({ messages: [], activeRoom: null });
  },

  sendMessage: (jobId: string, content: string) => {
    const { socket } = get();
    if (!socket) return;
    socket.emit('sendMessage', { jobId, content });
  },

  setMessages: (messages) => set({ messages }),
  addMessage: (message) => {
    const { messages } = get();
    set({ messages: [...messages, message] });
  },
}));