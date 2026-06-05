/**
 * ARTISAN-237 — Hook WebSocket temps réel
 * Connexion Socket.io pour le chat, notifications live, events.
 */

"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

interface UseWebsocketOptions {
  room?: string;
  autoConnect?: boolean;
}

export function useWebsocket({ room, autoConnect = true }: UseWebsocketOptions = {}) {
  const socketRef = useRef<ReturnType<typeof import('socket.io-client')['io']> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<{ event: string; data: unknown } | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    let socketInstance: ReturnType<typeof import('socket.io-client')['io']> | null = null;

    const initSocket = async () => {
      const { io } = await import('socket.io-client');
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      const socket = io(WS_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
      if (room) socket.emit('joinRoom', { room });

      const events = [
        'newQuote', 'quoteAccepted', 'jobUpdated', 'escrowUpdated',
        'newMessage', 'notification', 'disputeOpened', 'reviewReceived',
      ];

      events.forEach((event) => {
        socket.on(event, (data: unknown) => setLastMessage({ event, data }));
      });

      socketRef.current = socket;
      socketInstance = socket;
    };

    initSocket();

    return () => {
      socketInstance?.disconnect();
    };
  }, [room, autoConnect]);

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { isConnected, lastMessage, emit };
}