'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, MapPin, Briefcase, Clock, Filter, Loader2, ArrowRight } from 'lucide-react';
import apiClient from '../lib/api.client';
import { cn } from '../lib/cn';

interface Job {
  id: string;
  description: string;
  status: string;
  address: string;
  createdAt: string;
  client?: { firstName: string; lastName: string; };
  service?: { name: string; category?: { name: string; }; };
}

export default function MarketplacePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadJobs();
    loadServices();
  }, []);

  const loadJobs = async () => {
    try {
      const { data } = await apiClient.get('/jobs?status=SEARCHING');
      const raw = data?.data ?? data;
      const list = raw?.data ?? raw;
      setJobs(Array.isArray(list) ? list : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadServices = async () => {
    try {
      const { data } = await apiClient.get('/taxonomies/services');
      const list = data?.data ?? data;
      setServices(Array.isArray(list) ? list : []);
    } catch (err) { console.error(err); }
  };

  const filtered = jobs.filter((j) => {
    const matchSearch = !search || j.description?.toLowerCase().includes(search.toLowerCase()) || j.service?.name?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace des missions</h1>
          <p className="text-muted-foreground mt-1">Trouvez des chantiers près de chez vous et envoyez vos devis</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un métier, une mission..."
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="h-12 px-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Tous les métiers</option>
            {services.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{filtered.length} mission(s) disponible(s)</span>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Aucune mission disponible</h3>
            <p className="text-muted-foreground text-sm mt-1">Revenez plus tard, de nouvelles missions apparaîtront.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-border/50 rounded-2xl p-5 hover:shadow-md hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {job.service?.name || 'Service'}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(job.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground line-clamp-1 mb-1.5">{job.description}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  {job.client && <span>{job.client.firstName} {job.client.lastName}</span>}
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.address || 'Douala'}</span>
                </div>
                <Link
                  href={`/marketplace/${job.id}`}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Voir la mission <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}