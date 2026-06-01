'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/cn';
import { useAuthStore } from '../stores/auth.store';
import {
  MapPin,
  Search,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';
import Button from './ui/button';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  type NavLink = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
  
  const links: NavLink[] = [
    { href: '/', label: 'Carte', icon: MapPin },
    { href: '/comment-ca-marche', label: 'Fonctionnement', icon: Search },
    { href: '/artisans', label: 'Artisans', icon: User },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'glass shadow-sm'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">A</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Artisan237</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-colors',
                    pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface-container',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-container transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-container transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-foreground">
                      {user?.firstName}
                    </span>
                    <ChevronDown className="hidden lg:block h-4 w-4 text-muted-foreground" />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-56 glass rounded-xl shadow-lg overflow-hidden"
                      >
                        <div className="p-2">
                          <Link
                            href={user?.role === 'ARTISAN' ? '/dashboard/artisan' : '/dashboard/client'}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-container transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Tableau de bord
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-container transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            Paramètres
                          </Link>
                          <hr className="my-1 border-border" />
                          <button
                            onClick={() => { logout(); setIsProfileOpen(false); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg text-destructive hover:bg-destructive/5 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Déconnexion
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Connexion</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Inscription</Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-surface-container"
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border/50"
          >
            <div className="px-4 py-3 space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl hover:bg-surface-container"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    {link.label}
                  </Link>
                );
              })}
              {isAuthenticated && (
                <>
                  <hr className="my-2 border-border" />
                  <button
                    onClick={() => { logout(); setIsMobileOpen(false); }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm rounded-xl text-destructive hover:bg-destructive/5"
                  >
                    <LogOut className="h-5 w-5" />
                    Déconnexion
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}