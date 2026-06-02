'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, MapPin, Calendar, Clock, FileText, MessageSquare, Star, CheckCircle } from 'lucide-react';
import Button from '../../../../components/ui/button';
import { PageTransition } from '../../../../components/shared/page-transition';
import { ChatWindow } from '../../../../components/chat/chat-window';

export default function MissionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showChat, setShowChat] = useState(false);

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Retour</button>
        
        <div className="bento-card">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Réparation plomberie</h1>
              <p className="text-sm text-muted-foreground mt-1">Mission #{id?.toString().slice(0,8)}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">En recherche</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> Akwa, Douala</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" /> Cette semaine</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> Urgent</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Briefcase className="h-4 w-4" /> Plomberie</div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Fuite d'eau importante dans la salle de bain principale. Recherche un plombier disponible cette semaine.</p>
        </div>

        {/* Quotes section */}
        <div className="bento-card">
          <h2 className="font-semibold mb-4">Devis reçus (2)</h2>
          {[1,2].map((q) => (
            <motion.div key={q} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container transition-colors mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold text-sm">PT</div>
              <div className="flex-1"><p className="text-sm font-medium">Paul Tchuente</p><p className="text-xs text-muted-foreground">25 000 FCFA - Plomberie générale</p></div>
              <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /><span className="text-xs font-medium">4.8</span></div>
              <Button size="sm">Voir le devis</Button>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={() => setShowChat(!showChat)} variant="secondary" className="flex-1"><MessageSquare className="h-4 w-4 mr-1.5" /> Contacter un artisan</Button>
          <Button className="flex-1"><CheckCircle className="h-4 w-4 mr-1.5" /> Marquer comme complété</Button>
        </div>

        {showChat && <ChatWindow jobId={id as string} onClose={() => setShowChat(false)} />}
      </div>
    </PageTransition>
  );
}