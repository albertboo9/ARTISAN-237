'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, User, ShieldCheck, Ban } from 'lucide-react';
import { cn } from '../../lib/cn';
import { PageTransition } from '../../components/shared/page-transition';
import { ProtectedRoute } from '../../components/auth/protected-route';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetch(`http://localhost:3001/api/v1/users?page=${page}&pageSize=${pageSize}&role=ADMIN`)
      .then(r => r.json())
      .then(d => setUsers(d?.data || []))
      .catch(() => {});
  }, [page]);

  return (
    <ProtectedRoute requiredRole={['ADMIN']}>
      <PageTransition>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div><h1 className="text-2xl font-bold">Utilisateurs</h1><p className="text-muted-foreground">Gérez les comptes de la plateforme</p></div>
          </div>
          <div className="bento-card p-0 overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <div className="relative max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-surface-container border-none focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Rechercher..." /></div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-surface-container text-muted-foreground text-xs uppercase tracking-wider">
                <tr><th className="text-left p-4 font-medium">Utilisateur</th><th className="text-left p-4 font-medium hidden sm:table-cell">Email</th><th className="text-left p-4 font-medium hidden md:table-cell">Rôle</th><th className="text-left p-4 font-medium hidden md:table-cell">Statut</th><th className="p-4" /></tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((u: any, i: number) => (
                  <motion.tr key={u.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-surface-container/50 transition-colors">
                    <td className="p-4"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-xs">{u.firstName?.[0]}{u.lastName?.[0]}</div><span className="font-medium text-foreground">{u.firstName} {u.lastName}</span></div></td>
                    <td className="p-4 text-muted-foreground hidden sm:table-cell">{u.email || '-'}</td>
                    <td className="p-4 hidden md:table-cell"><span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'ARTISAN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700')}>{u.role}</span></td>
                    <td className="p-4 hidden md:table-cell"><span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{u.status}</span></td>
                    <td className="p-4 text-right"><button className="p-1.5 rounded-lg hover:bg-surface-container text-muted-foreground"><Ban className="h-4 w-4" /></button></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between p-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">{users.length} utilisateur(s)</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-surface-container disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
                <span className="text-xs font-medium">{page}</span>
                <button onClick={() => setPage(p => p+1)} className="p-1.5 rounded-lg hover:bg-surface-container"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}