'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, Loader2, Send } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import apiClient from '../../../lib/api.client';
import { showSuccessToast, showErrorToast } from '../../../lib/error-handler';

interface QuoteForm {
  jobId: string;
  amount: string;
  description: string;
  estimatedDays: string;
}

export default function ArtisanDevisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<QuoteForm>({
    jobId: searchParams.get('jobId') || '',
    amount: '',
    description: '',
    estimatedDays: '1',
  });

  useEffect(() => {
    if (form.jobId) setShowForm(true);
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const { data } = await apiClient.get('/quotes/mine');
      setQuotes(data?.data ?? data ?? []);
    } catch (err) {
      console.error('Erreur chargement devis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuote = async () => {
    if (!form.amount || !form.description) {
      showErrorToast('Veuillez remplir tous les champs');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post('/quotes', {
        jobId: form.jobId || undefined,
        amount: parseFloat(form.amount),
        description: form.description,
        estimatedDays: parseInt(form.estimatedDays),
      });
      showSuccessToast('Devis envoyé avec succès');
      setShowForm(false);
      setForm({ jobId: '', amount: '', description: '', estimatedDays: '1' });
      loadQuotes();
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || 'Erreur lors de l\'envoi du devis');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mes devis</h1>
          <p className="text-muted-foreground text-sm mt-1">Gérez vos propositions de prix</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
            Nouveau devis
          </button>
        )}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold">Créer un devis</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Montant (FCFA)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Ex: 25000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Délai estimé (jours)</label>
              <input
                type="number"
                value={form.estimatedDays}
                onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Ex: 3"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description du devis</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-4 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Détaillez les prestations incluses..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-border/60 text-sm font-medium rounded-xl hover:bg-surface-container transition-colors">
              Annuler
            </button>
            <button onClick={handleSubmitQuote} disabled={saving} className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {saving ? 'Envoi...' : 'Envoyer le devis'}
            </button>
          </div>
        </motion.div>
      )}

      {quotes.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun devis pour le moment</h3>
          <p className="text-muted-foreground text-sm">Créez votre premier devis pour répondre aux demandes.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {quotes.map((quote, i) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border/50 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-primary">{quote.amount?.toLocaleString()} FCFA</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    quote.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                    quote.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {quote.status === 'ACCEPTED' ? 'Accepté' : quote.status === 'REJECTED' ? 'Refusé' : 'En attente'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{quote.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{quote.estimatedDays} jour(s) estimé(s)</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}