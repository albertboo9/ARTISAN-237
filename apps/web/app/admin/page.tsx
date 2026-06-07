'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, Briefcase, Scale, TrendingUp, Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Search } from 'lucide-react';
import { cn } from '../lib/cn';
import { ProtectedRoute } from '../components/auth/protected-route';
import apiClient from '../lib/api.client';
import { showSuccessToast, showErrorToast } from '../lib/error-handler';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [pendingKyc, setPendingKyc] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'kyc' | 'users' | 'disputes'>('overview');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [statsRes, kycRes, disputesRes] = await Promise.allSettled([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/kyc/pending'),
        apiClient.get('/admin/disputes'),
      ]);

      if (statsRes.status === 'fulfilled') {
        const s = statsRes.value.data?.data ?? statsRes.value.data;
        setStats(s);
      }
      if (kycRes.status === 'fulfilled') {
        const k = kycRes.value.data?.data ?? kycRes.value.data;
        setPendingKyc(Array.isArray(k) ? k : []);
      }
      if (disputesRes.status === 'fulfilled') {
        const d = disputesRes.value.data?.data ?? disputesRes.value.data;
        setDisputes(Array.isArray(d) ? d : []);
      }
    } catch (err) {
      console.error('Erreur chargement admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKycAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      await apiClient.post(`/admin/kyc/${action}`, { userId });
      showSuccessToast(action === 'approve' ? 'KYC approuvé' : 'KYC rejeté');
      loadAdminData();
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || 'Erreur');
    }
  };

  const defaultStats = [
    { label: 'Utilisateurs', value: stats?.totalUsers ?? '...', icon: Users, color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Missions', value: stats?.totalJobs ?? '...', icon: Briefcase, color: 'bg-amber-500/10 text-amber-600' },
    { label: 'Litiges', value: stats?.totalDisputes ?? '...', icon: Scale, color: 'bg-red-500/10 text-red-600' },
    { label: 'KYC en attente', value: pendingKyc.length, icon: Shield, color: 'bg-purple-500/10 text-purple-600' },
  ];

  if (loading) {
    return (
      <ProtectedRoute requiredRole={['ADMIN']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={['ADMIN']}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Administration</h1>
            <p className="text-muted-foreground text-sm mt-1">Gestion de la plateforme</p>
          </div>
          <div className="flex gap-2 bg-card border border-border/50 rounded-xl p-1">
            {(['overview', 'kyc', 'users', 'disputes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize',
                  activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab === 'overview' ? 'Vue d\'ensemble' : tab === 'kyc' ? 'KYC' : tab === 'users' ? 'Utilisateurs' : 'Litiges'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {defaultStats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border/50 rounded-2xl p-5">
                    <div className="flex items-center gap-4">
                      <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', s.color)}><Icon className="h-6 w-6" /></div>
                      <div><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* KYC Pending */}
              <div className="bg-card border border-border/50 rounded-2xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  Demandes KYC en attente
                </h3>
                {pendingKyc.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Aucune demande en attente</p>
                ) : (
                  <div className="space-y-2">
                    {pendingKyc.slice(0, 5).map((k: any) => (
                      <div key={k.id} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                        <div>
                          <p className="text-sm font-medium">{k.user?.firstName} {k.user?.lastName}</p>
                          <p className="text-xs text-muted-foreground">{k.user?.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleKycAction(k.userId, 'approve')} className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleKycAction(k.userId, 'reject')} className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Disputes */}
              <div className="bg-card border border-border/50 rounded-2xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Litiges récents
                </h3>
                {disputes.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Aucun litige en cours</p>
                ) : (
                  <div className="space-y-2">
                    {disputes.slice(0, 5).map((d: any) => (
                      <div key={d.id} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                        <div>
                          <p className="text-sm font-medium">{d.reason || 'Litige'}</p>
                          <p className="text-xs text-muted-foreground">{d.job?.title || 'Mission #' + d.jobId}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          d.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                          d.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {d.status === 'OPEN' ? 'Ouvert' : d.status === 'RESOLVED' ? 'Résolu' : 'En cours'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'kyc' && (
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <h3 className="font-semibold mb-4">Toutes les demandes KYC</h3>
            {pendingKyc.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Aucune demande KYC en attente de validation</p>
            ) : (
              <div className="space-y-2">
                {pendingKyc.map((k: any) => (
                  <div key={k.id} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {k.user?.firstName?.[0]}{k.user?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{k.user?.firstName} {k.user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{k.user?.email} — {k.user?.phoneNumber}</p>
                        <p className="text-xs text-muted-foreground">Document: {k.documentType || 'CNI'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleKycAction(k.userId, 'approve')} className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Approuver
                      </button>
                      <button onClick={() => handleKycAction(k.userId, 'reject')} className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <h3 className="font-semibold mb-4">Gestion des utilisateurs</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Rechercher un utilisateur..." />
              </div>
            </div>
            <p className="text-sm text-muted-foreground py-4 text-center">Connectez-vous à la base de données pour voir la liste complète.</p>
          </div>
        )}

        {activeTab === 'disputes' && (
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <h3 className="font-semibold mb-4">Gestion des litiges</h3>
            {disputes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Aucun litige en cours</p>
            ) : (
              <div className="space-y-2">
                {disputes.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-4 bg-surface rounded-xl">
                    <div>
                      <p className="text-sm font-medium">{d.reason || 'Litige'}</p>
                      <p className="text-xs text-muted-foreground">Mission: {d.job?.title || d.jobId}</p>
                      <p className="text-xs text-muted-foreground">Client: {d.client?.firstName} {d.client?.lastName} | Artisan: {d.artisan?.firstName} {d.artisan?.lastName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        d.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                        d.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>{d.status}</span>
                      <Link href={`/admin/disputes/${d.id}`} className="text-sm text-primary font-medium hover:underline">Voir</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
