"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, User, X } from "lucide-react";
import { useWebsocket } from "../../hooks/useWebsocket";
import Button from "../ui/button";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface ChatWindowProps {
  jobId: string;
  otherUserName: string;
  currentUserId: string;
  onClose?: () => void;
}

export function ChatWindow({ jobId, otherUserName, currentUserId, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { isConnected, lastMessage, emit } = useWebsocket({ room: `job:${jobId}` });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (lastMessage?.event === "newMessage") {
      const msg = lastMessage.data as Message;
      setMessages((prev) => [...prev, msg]);
    }
  }, [lastMessage]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: "Moi",
      content: input.trim(),
      timestamp: new Date(),
      isOwn: true,
    };
    setMessages((prev) => [...prev, msg]);
    emit("sendMessage", { room: `job:${jobId}`, message: msg });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-brand-primary text-white shadow-xl hover:bg-brand-hover transition-all z-50 flex items-center justify-center"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-6 right-6 w-80 sm:w-96 bg-card rounded-2xl shadow-2xl border border-surface-container-high z-50 overflow-hidden flex flex-col"
      style={{ maxHeight: "500px" }}
    >
      {/* Header */}
      <div className="bg-brand-primary text-on-primary px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`} />
          <span className="font-semibold text-sm">{otherUserName}</span>
        </div>
        <button onClick={() => { setIsOpen(false); onClose?.(); }} className="text-white/80 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-brand-bg" style={{ minHeight: "300px" }}>
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                  msg.isOwn
                    ? 'bg-brand-primary text-on-primary rounded-br-sm'
                    : 'bg-surface-container text-on-surface rounded-bl-sm'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.isOwn ? 'text-white/60' : 'text-on-surface-variant'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-surface-container-high p-3 bg-card">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message..."
            className="flex-1 h-10 px-4 rounded-xl bg-surface-container text-sm outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center hover:bg-brand-hover disabled:opacity-40 transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}