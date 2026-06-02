'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, Phone, Video } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { PageTransition } from '../../../components/shared/page-transition';

const conversations = [
  { id: '1', name: 'Jean Dupont', lastMsg: 'Acceptez-vous de passer cette semaine ?', time: '10:15', unread: 1, online: true },
  { id: '2', name: 'Marie Ngono', lastMsg: 'Merci pour votre devis !', time: 'Hier', unread: 0, online: false },
];

export default function ArtisanMessagesPage() {
  const [activeId, setActiveId] = useState('1');
  const [input, setInput] = useState('');
  const active = conversations.find(c => c.id === activeId);

  return (
    <PageTransition>
      <div className="flex h-[calc(100vh-8rem)] -m-6">
        <div className="w-80 border-r border-border/50 bg-card">
          <div className="p-4 border-b border-border/50">
            <h2 className="font-semibold text-foreground">Messages</h2>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input className="w-full h-9 pl-9 pr-3 text-sm rounded-xl bg-surface-container border-none focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Rechercher..." />
            </div>
          </div>
          <div className="overflow-y-auto h-full">
            {conversations.map((conv) => (
              <button key={conv.id} onClick={() => setActiveId(conv.id)} className={cn('flex items-center gap-3 w-full p-3 text-left hover:bg-surface-container transition-colors border-b border-border/25', activeId === conv.id && 'bg-surface-container')}>
                <div className="relative flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold text-sm">{conv.name.split(' ').map(n => n[0]).join('')}</div>
                  {conv.online && <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-green-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium text-foreground">{conv.name}</span><span className="text-[10px] text-muted-foreground">{conv.time}</span></div>
                  <p className="text-xs text-muted-foreground truncate">{conv.lastMsg}</p>
                </div>
                {conv.unread > 0 && <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{conv.unread}</div>}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-card">
          {active && (
            <>
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold text-xs">{active.name.split(' ').map(n => n[0]).join('')}</div>
                  <div><h3 className="text-sm font-medium text-foreground">{active.name}</h3><p className="text-[10px] text-green-600">{active.online ? 'En ligne' : 'Hors ligne'}</p></div>
                </div>
                <div className="flex items-center gap-1"><button className="p-2 rounded-xl hover:bg-surface-container text-muted-foreground"><Phone className="h-4 w-4" /></button><button className="p-2 rounded-xl hover:bg-surface-container text-muted-foreground"><Video className="h-4 w-4" /></button></div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {[{ text: 'Bonjour, acceptez-vous de passer cette semaine pour la réparation ?', sent: false, time: '10:10' },{ text: 'Bonjour, oui je suis disponible jeudi ou vendredi.', sent: true, time: '10:12' },{ text: 'Parfait, je vous confirme jeudi matin.', sent: false, time: '10:15' }].map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn('flex', msg.sent ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[70%] px-4 py-2.5 rounded-2xl text-sm', msg.sent ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-surface-container text-foreground rounded-bl-md')}>
                      <p>{msg.text}</p><p className={cn('text-[10px] mt-1', msg.sent ? 'text-primary-foreground/60' : 'text-muted-foreground')}>{msg.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <input value={input} onChange={e => setInput(e.target.value)} placeholder="Écrivez un message..." className="flex-1 h-10 px-4 text-sm rounded-xl border border-border bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white"><Send className="h-4 w-4" /></button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}