'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/cn';
import { ProtectedRoute } from '../components/auth/protected-route';
import { useAuthStore } from '../stores/auth.store';
import {
  LayoutDashboard, Briefcase, FileText, MessageSquare, Users, LogOut,
  ChevronLeft, Menu, Bell, X, Plus, Shield,
} from 'lucide-react';

const clientNav = [
  { label: 'Tableau de bord', href: '/dashboard/client', icon: LayoutDashboard },
  { label: 'Mes missions', href: '/dashboard/client/missions', icon: Briefcase },
  { label: 'Nouvelle mission', href: '/dashboard/client/create', icon: Plus },
  { label: 'Mes devis', href: '/dashboard/client/quotes', icon: FileText },
  { label: 'Messagerie', href: '/dashboard/client/messages', icon: MessageSquare },
];

const artisanNav = [
  { label: 'Tableau de bord', href: '/dashboard/artisan', icon: LayoutDashboard },
  { label: 'Mon profil', href: '/dashboard/artisan/profil', icon: Users },
  { label: 'Mes devis', href: '/dashboard/artisan/devis', icon: FileText },
  { label: 'KYC', href: '/dashboard/artisan/kyc', icon: Shield },
  { label: 'Messagerie', href: '/dashboard/artisan/messages', icon: MessageSquare },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isArtisan = user?.role === 'ARTISAN';
  const nav = isArtisan ? artisanNav : clientNav;

  return (
    <ProtectedRoute requiredRole={['CLIENT', 'ARTISAN']}>
      <div className="min-h-screen bg-surface">
        {/* Mobile overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-border/50 transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'lg:w-64' : 'lg:w-16',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}>
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-white">A</span>
                </div>
                <span className={cn('text-sm font-semibold text-foreground transition-opacity', !sidebarOpen && 'lg:hidden')}>Artisan237</span>
              </Link>
              <button onClick={() => { setSidebarOpen(!sidebarOpen); setMobileOpen(false); }} className="p-1.5 rounded-lg hover:bg-surface-container text-muted-foreground hidden lg:block">
                <ChevronLeft className={cn('h-4 w-4 transition-transform', !sidebarOpen && 'rotate-180')} />
              </button>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-container text-muted-foreground lg:hidden">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {nav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-surface-container',
                    )}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className={cn('transition-opacity', !sidebarOpen && 'lg:hidden')}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User */}
            <div className="border-t border-border/50 p-3">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-xs">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className={cn('flex-1 min-w-0 transition-opacity', !sidebarOpen && 'lg:hidden')}>
                  <p className="text-sm font-medium text-foreground truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase()}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className={cn('transition-all duration-300', sidebarOpen ? 'lg:pl-64' : 'lg:pl-16')}>
          {/* Top bar */}
          <header className="sticky top-0 z-30 glass border-b border-border/50">
            <div className="flex h-16 items-center justify-between px-4 lg:px-6">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-surface-container">
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex-1" />
              <div className="flex items-center gap-3">
                <button className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-container transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                </button>
                <button onClick={() => { logout(); }} className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors" title="Déconnexion">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}