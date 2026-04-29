'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, X, Settings, Edit2, Trash2, LogOut, Loader2, WifiOff } from 'lucide-react';
import { SiloCard } from '@/components/SiloCard';
import { SiloForm } from '@/components/SiloForm';
import { Confetti } from '@/components/Confetti';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { Silo, SiloWithProgress } from '@/types';

export function Lobby() {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSilo, setEditingSilo] = useState<Silo | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const prevProgressRef = useRef<Record<string, number>>({});

  const { user, loading: authLoading, signOut, initialize } = useAuthStore();
  const {
    silos,
    addSilo,
    updateSilo,
    deleteSilo,
    getSilosWithProgress,
    isOnline,
    isLoading,
    isSyncing,
    initialize: initData,
  } = useDataStore();

  const silosWithProgress = getSilosWithProgress();

  useEffect(() => {
    const init = async () => {
      await initialize();
    };
    init();
  }, []);

  useEffect(() => {
    if (user) {
      initData();
    }
  }, [user]);

  useEffect(() => {
    silosWithProgress.forEach((silo) => {
      const prevProgress = prevProgressRef.current[silo.id];
      if (prevProgress !== undefined && silo.progress === 100 && prevProgress < 100) {
        setShowConfetti(true);
        if (navigator.vibrate) {
          navigator.vibrate([50, 50, 50]);
        }
      }
      prevProgressRef.current[silo.id] = silo.progress;
    });
  }, [silosWithProgress]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading]);

  const handleCreateSilo = (siloData: Partial<Silo> & { name: string }) => {
    const newSilo: Silo = {
      id: `silo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user?.id || 'local',
      name: siloData.name,
      icon: siloData.icon || 'star',
      color_theme: siloData.color_theme || '#6366f1',
      created_at: new Date().toISOString(),
      silo_type: siloData.silo_type || 'recurring'
    };
    addSilo(newSilo);
  };

  const handleUpdateSilo = (siloData: Partial<Silo> & { name: string }) => {
    if (editingSilo) {
      updateSilo(editingSilo.id, {
        name: siloData.name,
        icon: siloData.icon,
        color_theme: siloData.color_theme
      });
      setEditingSilo(null);
    }
  };

  const handleDeleteSilo = (silo: SiloWithProgress) => {
    if (confirm(`Delete "${silo.name}"? This can't be undone.`)) {
      deleteSilo(silo.id);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const streak = Math.min(dayOfYear, 0);

  return (
    <div className="min-h-screen bg-background">
      <Confetti trigger={showConfetti} />
      
      <div className="mx-auto max-w-2xl px-4 py-6">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">SynergyHub</h1>
            <p className="text-sm text-muted-foreground font-mono">
              {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <div className="flex items-center gap-1 rounded-full bg-orange-500/20 px-3 py-2 text-orange-400 border border-orange-500/30">
                <WifiOff className="h-4 w-4" />
              </div>
            )}
            {isSyncing && <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />}
            <div className="flex items-center gap-2 rounded-full glass-card px-4 py-2 border border-white/10">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-bold font-mono text-foreground">{streak}</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/50 border border-white/10 transition-colors hover:bg-slate-700/50"
              >
                <Settings className="h-5 w-5 text-muted-foreground" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-12 z-50 w-48 rounded-xl glass-card border border-white/10 p-2 shadow-xl"
                  >
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Silos</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : silosWithProgress.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 py-16 text-center glass-card"
            >
              <p className="mb-4 text-muted-foreground">No silos yet</p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                Create Your First Silo
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {silosWithProgress.map((silo, index) => (
                <motion.div
                  key={silo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
                  className="group relative"
                >
                  <SiloCard
                    silo={silo}
                    onClick={() => router.push(`/silo/${silo.id}`)}
                    onLongPress={() => {
                      setEditingSilo(silo);
                      setIsFormOpen(true);
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSilo(silo);
                        setIsFormOpen(true);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80 border border-white/10 shadow-sm transition-colors hover:bg-slate-700"
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSilo(silo);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80 border border-white/10 shadow-sm transition-colors hover:bg-destructive/20 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setIsFormOpen(true)}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 py-8 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5"
              >
                <Plus className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Add Silo</span>
              </motion.button>
            </div>
          )}
        </section>
      </div>

      <SiloForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSilo(null);
        }}
        onSubmit={editingSilo ? handleUpdateSilo : handleCreateSilo}
        initialData={editingSilo || undefined}
      />
    </div>
  );
}