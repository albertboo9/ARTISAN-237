'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, X, Loader2, User, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useChatStore, Message } from '../../stores/chat.store';
import { useAuthStore } from '../../stores/auth.store';
import Button from '../ui/button';

interface ChatWindowProps {
  jobId: string;
  onClose?: () => void;
  minimized?: boolean;
}

export function ChatWindow({ jobId, onClose, minimized }: ChatWindowProps) {
  const { connect, disconnect, joinRoom, sendMessage, messages, isConnected } = useChatStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(minimized || false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      connect(token);
      joinRoom(jobId);
    }
    return () => { disconnect(); };
  }, [jobId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(jobId, input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-border/50 transition-all duration-300',
      isMinimized ? 'w-72 h-14' : 'w-80 sm:w-96 h-[500px]',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className={cn('h-2.5 w-2.5 rounded-full', isConnected ? 'bg-green-500' : 'bg-gray-300')} />
          <span className="text-sm font-semibold text-foreground">Messagerie</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 rounded-lg hover:bg-surface-container text-muted-foreground">
            <ChevronDown className={cn('h-4 w-4 transition-transform', isMinimized && 'rotate-180')} />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">Aucun message. Commencez la conversation !</p>
              </div>
            )}
            <AnimatePresence>
              {messages.map((msg, i) => {
                const isOwn = msg.senderId === user?.id;
                return (
                  <motion.div
                    key={msg.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                  >
                    <div className={cn(
                      'max-w-[80%] px-3 py-2 rounded-2xl text-sm',
                      isOwn ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-surface-container text-foreground rounded-bl-md',
                    )}>
                      <p>{msg.content}</p>
                      <p className={cn('text-[10px] mt-0.5', isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
                        {msg.senderName || 'Inconnu'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez un message..."
                className="flex-1 h-10 px-3 text-sm rounded-xl border border-border bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function ChatButton({ jobId }: { jobId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <MessageSquare className="h-4 w-4 mr-1.5" />
        Chat
      </Button>
      {isOpen && <ChatWindow jobId={jobId} onClose={() => setIsOpen(false)} />}
    </>
  );
}