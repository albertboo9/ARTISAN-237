'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle, Clock, Loader2, Plus, Send, MapPin, Sparkles, Briefcase, DollarSign } from 'lucide-react';
import Button from '../../../components/ui/button';
import { showErrorToast, showSuccessToast } from '../../../lib/error-handler';
import axios from 'axios';
import Link from 'next/link';
import { cn } from '../../../lib/cn';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function unwrap(data: any) { return data?.data ?? data; }

export default function ArtisanDevisPage() {
  const [tab, setTab] = useState<'available' | 'mine'>('available');
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [myQuotes, setMyQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState({ estimatedPrice: '', description: '', materialsPrice: '', laborPrice: '' });
  const [submitting, setSubmitting] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch available jobs (SEARCHING status)
        const { data: jobsData } = await axios.get(`${API_URL}/jobs?status=SEARCHING&pageSize=50`, getHeaders());
        const jobsBody = unwrap(jobsData);
        setAvailableJobs(jobsBody?.data || jobsBody || []);

        // Fetch my quotes
        const { data: quotesData } = await axios.get(`${API_URL}/quotes`, getHeaders());
        const quotesBody = unwrap(quotesData);
        setMyQuotes(Array.isArray(quotesBody) ? quotesBody : quotesBody?.data || []);
      } catch (err) {
        showErrorToast('Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSubmitQuote = async (jobId: string) => {
    if (!quoteForm.estimatedPrice || !quoteForm.description) {
      showErrorToast('Veuillez remplir le prix estimé et la description');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/quotes`, {
        jobId,
        estimatedPrice: parseFloat(quoteForm.estimatedPrice),
        description: quoteForm.description,
        materialsPrice: quoteForm.materialsPrice ? parseFloat(quoteForm.materialsPrice) : undefined,
        laborPrice: quoteForm.laborPrice ? parseFloat(quoteForm.laborPrice) : undefined,
      }, getHeaders());
      showSuccessToast('Devis soumis avec succès !');
      setSelectedJob(null);
      setQuoteForm({ estimatedPrice: '', description: '', materialsPrice: '', laborPrice: '' });
      // Refresh
      const { data: quotesData } = await axios.get(`${API_URL}/quotes`, getHeaders());
      setMyQuotes(unwrap(quotesData) || []);
    } catch (err) {
      showErrorToast('Erreur lors de la soumission du devis');
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig: Record<string, { label: string; style: string; icon: any }> = {
    PENDING: { label: 'En attente', style: 'bg-amber-100 text-amber-700', icon: Clock },
    ACCEPTED: { label: 'Accepté', style: 'bg-green-100 text-green-700', icon: CheckCircle },
    REJECTED: { label: 'Refusé', style: 'bg-red-100 text-red-700', icon: XCircle },
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">Mes devis</h1>
            <p className="text-on-surface-variant mt-1">Proposez vos services aux clients</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-surface-container-high pb-2">
          <button
            onClick={() => setTab('available')}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', tab === 'available' ? 'bg-brand-primary text-white' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container')}
          >
            <Sparkles size={16} className="inline mr-1.5" /> Missions disponibles
          </button>
          <button
            onClick={() => setTab('mine')}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', tab === 'mine' ? 'bg-brand-primary text-white' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container')}
          >
            <FileText size={16} className="inline mr-1.5" /> Mes devis ({myQuotes.length})
          </button>
        </div>

        {tab === 'available' && (
          <div className="space-y-4">
            {availableJobs.length === 0 ? (
              <div className="bento-card text-center py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-brand-primary" />
                </div>
                <h3 className="text-lg font-semibold text-on-surface">Aucune mission disponible</h3>
                <p className="text-on-surface-variant mt-2">Revenez plus tard, de nouvelles missions apparaissent régulièrement.</p>
              </div>
            ) : (
              availableJobs.map((job: any, i: number) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bento-card"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-on-surface">{job.service?.name || 'Service'}</h3>
                        {job.quotes?.length > 0 && (
                          <span className="text-xs text-on-surface-variant">({job.quotes.length} devis)</span>
                        )}
                      </div>
                      <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {job.address || 'Douala'}</span>
                        <span className="flex items-center gap-1"><Briefcase size={12} /> {job.service?.category?.name || 'Général'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {selectedJob === job.id ? (
                        <Button size="sm" variant="secondary" onClick={() => setSelectedJob(null)}>Annuler</Button>
                      ) : (
                        <Button size="sm" className="bg-brand-primary text-white hover:bg-brand-hover" onClick={() => setSelectedJob(job.id)}>
                          <Plus size={16} className="mr-1" /> Faire un devis
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Quote Form */}
                  {selectedJob === job.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-surface-container-high space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-on-surface-variant mb-1">Prix estimé (FCFA) *</label>
                          <input type="number" value={quoteForm.estimatedPrice} onChange={(e) => setQuoteForm(f => ({ ...f, estimatedPrice: e.target.value }))}
                            className="w-full h-10 px-3 rounded-xl border border-surface-container-high bg-card text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none"
                            placeholder="Ex: 50000" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-on-surface-variant mb-1">Prix matériaux (FCFA)</label>
                          <input type="number" value={quoteForm.materialsPrice} onChange={(e) => setQuoteForm(f => ({ ...f, materialsPrice: e.target.value }))}
                            className="w-full h-10 px-3 rounded-xl border border-surface-container-high bg-card text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none"
                            placeholder="Optionnel" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-on-surface-variant mb-1">Main d'œuvre (FCFA)</label>
                          <input type="number" value={quoteForm.laborPrice} onChange={(e) => setQuoteForm(f => ({ ...f, laborPrice: e.target.value }))}
                            className="w-full h-10 px-3 rounded-xl border border-surface-container-high bg-card text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none"
                            placeholder="Optionnel" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-on-surface-variant mb-1">Description du devis *</label>
                        <textarea value={quoteForm.description} onChange={(e) => setQuoteForm(f => ({ ...f, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 rounded-xl border border-surface-container-high bg-card text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none resize-none"
                          placeholder="Décrivez ce que vous proposez..."
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setSelectedJob(null)}>Annuler</Button>
                        <Button size="sm" isLoading={submitting} className="bg-brand-primary text-white hover:bg-brand-hover" onClick={() => handleSubmitQuote(job.id)}>
                          <Send size={16} className="mr-1" /> {submitting ? 'Envoi...' : 'Soumettre le devis'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}

        {tab === 'mine' && (
          <div className="space-y-4">
            {myQuotes.length === 0 ? (
              <div className="bento-card text-center py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 mx-auto mb-4">
                  <FileText className="h-8 w-8 text-brand-primary" />
                </div>
                <h3 className="text-lg font-semibold text-on-surface">Aucun devis soumis</h3>
                <p className="text-on-surface-variant mt-2">Consultez les missions disponibles et proposez vos services.</p>
              </div>
            ) : (
              myQuotes.map((q: any, i: number) => {
                const config = statusConfig[q.status || 'PENDING'] || statusConfig.PENDING;
                const Icon = config.icon;
                return (
                  <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bento-card flex items-center gap-4"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent/10 flex-shrink-0">
                      <DollarSign className="h-6 w-6 text-brand-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-on-surface">{q.job?.service?.name || 'Mission'}</p>
                      <p className="text-sm text-on-surface-variant">
                        {q.estimatedPrice ? `${Number(q.estimatedPrice).toLocaleString()} FCFA` : ''}
                        {q.createdAt ? ` • ${new Date(q.createdAt).toLocaleDateString('fr-FR')}` : ''}
                      </p>
                    </div>
                    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.style)}>
                      <Icon className="h-3.5 w-3.5" /> {config.label}
                    </span>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}