'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, X, Settings, Edit2, Trash2, LogOut, Loader2, WifiOff } from 'lucide-react';
import { SiloCard } from '@/components/SiloCard';
import { SiloForm } from '@/components/SiloForm';
import { ContributionHeatmap } from '@/components/ContributionHeatmap';
import { Confetti } from '@/components/Confetti';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { Silo, SiloWithProgress } from '@/types';

export function Lobby() {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSilo, setEditingSilo] = useState<Silo | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [heatmapExpanded, setHeatmapExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, loading: authLoading, signOut, initialize } = useAuthStore();
  const {
    silos,
    addSilo,
    updateSilo,
    deleteSilo,
    getSilosWithProgress,
    getHeatmapData,
    isOnline,
    isLoading,
    isSyncing,
    initialize: initData,
    syncFromServer,
  } = useDataStore();

  const silosWithProgress = getSilosWithProgress();
  const heatmapData = getHeatmapData();

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
      created_at: new Date().toISOString()
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <h1 className="text-2xl font-bold tracking-tight">SynergyHub</h1>
            <p className="text-sm text-muted-foreground">
              {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <div className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-2 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <WifiOff className="h-4 w-4" />
              </div>
            )}
            {isSyncing && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-bold">{streak}</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
              >
                <Settings className="h-5 w-5" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-input bg-card p-2 shadow-lg"
                  >
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
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
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Your Silos</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : silosWithProgress.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-input py-16 text-center"
            >
              <p className="mb-4 text-muted-foreground">No silos yet</p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
                  transition={{ delay: index * 0.1 }}
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
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 shadow-sm transition-colors hover:bg-muted"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSilo(silo);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 shadow-sm transition-colors hover:bg-destructive/10 hover:text-destructive"
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
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-input py-8 transition-colors hover:border-primary/50 hover:bg-muted/30"
              >
                <Plus className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Add Silo</span>
              </motion.button>
            </div>
          )}
        </section>

        <section>
          <button
            onClick={() => setHeatmapExpanded(!heatmapExpanded)}
            className="mb-4 flex w-full items-center justify-between"
          >
            <h2 className="text-sm font-medium text-muted-foreground">Contribution Activity</h2>
            <svg
              className={`h-4 w-4 text-muted-foreground transition-transform ${heatmapExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <AnimatePresence>
            {heatmapExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden rounded-xl border border-input bg-card p-4"
              >
                <ContributionHeatmap data={heatmapData} />
              </motion.div>
            )}
          </AnimatePresence>
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