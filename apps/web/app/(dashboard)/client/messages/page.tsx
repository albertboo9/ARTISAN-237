'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Phone, Video, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { PageTransition } from '../../../components/shared/page-transition';
import { useAuthStore } from '../../../stores/auth.store';
import { useChatStore } from '../../../stores/chat.store';
import apiClient  from '../../../lib/api.client';

export default function ClientMessagesPage() {
  const { user } = useAuthStore();
  const { connect, disconnect, joinRoom, sendMessage, messages, isConnected } = useChatStore();
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load active jobs as conversations
  useEffect(() => {
    async function fetchConversations() {
      if (!user?.id) return;
      try {
        // Fetch jobs for the client
        const { data: raw } = await apiClient.get(`/jobs?clientId=${user.id}`);
        const jobsList = raw?.data ?? raw ?? [];
        
        // Only show jobs that have an accepted quote (thus an artisan)
        const activeJobs = jobsList
          .filter((j: any) => j.status === 'QUOTE_ACCEPTED' || j.status === 'IN_PROGRESS')
          .map((j: any) => {
            // Find the accepted quote to get the artisan name
            const acceptedQuote = j.quotes?.find((q: any) => q.status === 'ACCEPTED');
            const artisanName = acceptedQuote?.artisan ? `${acceptedQuote.artisan.firstName} ${acceptedQuote.artisan.lastName}` : 'Artisan';
            
            return {
              id: j.id,
              name: artisanName,
              title: j.title || j.description?.slice(0, 30) || 'Mission',
              lastMsg: 'Connecté pour la mission',
              time: new Date(j.createdAt || Date.now()).toLocaleDateString('fr-FR'),
              unread: 0,
              online: false
            };
          });
          
        setConversations(activeJobs);
        if (activeJobs.length > 0) {
          setActiveId(activeJobs[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConversations();
  }, [user]);

  // Handle WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      connect(token);
    }
    return () => { disconnect(); };
  }, [connect, disconnect]);

  // Handle room joining
  useEffect(() => {
    if (activeId && isConnected) {
      joinRoom(activeId);
    }
  }, [activeId, isConnected, joinRoom]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !activeId) return;
    sendMessage(activeId, input.trim());
    setInput('');
  };

  const active = conversations.find(c => c.id === activeId);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="flex h-[calc(100vh-8rem)] -m-6 border border-border/50 rounded-xl overflow-hidden shadow-sm">
        <div className="w-80 border-r border-border/50 bg-surface">
          <div className="p-4 border-b border-border/50">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              Messages
              <div className={cn('h-2 w-2 rounded-full', isConnected ? 'bg-green-500' : 'bg-red-500')} title={isConnected ? 'Connecté' : 'Déconnecté'} />
            </h2>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input className="w-full h-9 pl-9 pr-3 text-sm rounded-xl bg-surface-container border-none focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Rechercher..." />
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(100%-80px)]">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                Aucune conversation active. Acceptez un devis pour commencer à discuter avec l'artisan.
              </div>
            ) : (
              conversations.map((conv) => (
                <button 
                  key={conv.id} 
                  onClick={() => setActiveId(conv.id)} 
                  className={cn('flex items-center gap-3 w-full p-4 text-left hover:bg-surface-container transition-colors border-b border-border/25', activeId === conv.id && 'bg-primary/5')}
                >
                  <div className="relative flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold text-sm">
                      {conv.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground truncate">{conv.name}</span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{conv.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate font-medium mt-0.5">{conv.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMsg}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col bg-surface">
          {active ? (
            <>
              <div className="flex items-center justify-between p-4 border-b border-border/50 bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold text-sm">
                    {active.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{active.name}</h3>
                    <p className="text-xs text-muted-foreground">{active.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-xl hover:bg-surface-container text-muted-foreground"><Phone className="h-4 w-4" /></button>
                  <button className="p-2 rounded-xl hover:bg-surface-container text-muted-foreground"><Video className="h-4 w-4" /></button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-low">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                    <MessageSquare className="h-12 w-12 mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Aucun message pour l'instant.</p>
                  </div>
                ) : (
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
                            'max-w-[70%] px-4 py-2.5 text-sm shadow-sm', 
                            isOwn 
                              ? 'bg-primary text-white rounded-2xl rounded-tr-sm' 
                              : 'bg-white text-foreground rounded-2xl rounded-tl-sm border border-border/50'
                          )}>
                            <p>{msg.content}</p>
                            <p className={cn(
                              'text-[10px] mt-1 text-right', 
                              isOwn ? 'text-white/70' : 'text-muted-foreground'
                            )}>
                              {new Date(msg.createdAt || Date.now()).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-4 border-t border-border/50 bg-white">
                <div className="flex items-center gap-2">
                  <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Écrivez un message..." 
                    className="flex-1 h-12 px-4 text-sm rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20" 
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-50 hover:bg-primary/90 transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-surface-container-low">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Sélectionnez une conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}