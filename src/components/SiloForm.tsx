'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { ICON_NAMES, getIcon, type IconKey } from '@/utils/icons';
import type { Silo } from '@/types';

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#ec4899', '#10B981'
];

interface SiloFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (silo: Partial<Silo> & { name: string }) => void;
  initialData?: Silo;
}

export function SiloForm({ isOpen, onClose, onSubmit, initialData }: SiloFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [icon, setIcon] = useState(initialData?.icon || 'star');
  const [color, setColor] = useState(initialData?.color_theme || '#6366f1');
  const [siloType, setSiloType] = useState<'recurring' | 'one-time'>(initialData?.silo_type || 'recurring');
  const [iconOpen, setIconOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), icon, color_theme: color, silo_type: siloType });
    setName('');
    setIcon('star');
    setColor('#6366f1');
    setSiloType('recurring');
    onClose();
  };

  const SelectedIcon = getIcon(icon as IconKey);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-4 right-4 top-1/2 z-50 -translate-y-1/2 rounded-2xl glass-card border border-white/10 p-6 shadow-xl md:left-1/2 md:right-auto md:w-full md:max-w-md md:translate-x-[-50%]"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                {initialData ? 'Edit Silo' : 'New Silo'}
              </h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/50 border border-white/10 transition-colors hover:bg-slate-700/50"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Maintenance Motor"
                  className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Icon</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIconOpen(!iconOpen)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-foreground transition-all hover:border-white/20"
                  >
                    <div className="flex items-center gap-3">
                      <SelectedIcon className="h-5 w-5" style={{ color }} />
                      <span className="capitalize">{icon}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${iconOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {iconOpen && (
                    <div className="absolute z-10 mt-2 grid max-h-48 w-full grid-cols-5 gap-2 overflow-auto rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-xl backdrop-blur">
                      {ICON_NAMES.map((iconKey) => {
                        const IconComp = getIcon(iconKey as IconKey);
                        return (
                          <button
                            key={iconKey}
                            type="button"
                            onClick={() => { setIcon(iconKey); setIconOpen(false); }}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                              icon === iconKey ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-slate-800 text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <IconComp className="h-5 w-5" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Color</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setColorOpen(!colorOpen)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-foreground transition-all hover:border-white/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full shadow-lg" style={{ backgroundColor: color }} />
                      <span className="font-mono text-sm text-muted-foreground">{color}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${colorOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {colorOpen && (
                    <div className="absolute z-10 mt-2 grid max-h-48 w-full grid-cols-6 gap-2 overflow-auto rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-xl backdrop-blur">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { setColor(c); setColorOpen(false); }}
                          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                            color === c ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: c }}
                        >
                          {color === c && <Check className="h-4 w-4 text-white" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Type</label>
                <div className="flex rounded-xl border border-white/10 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setSiloType('recurring')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                      siloType === 'recurring'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                        : 'bg-slate-800/50 text-muted-foreground hover:bg-slate-700/50'
                    }`}
                  >
                    🔄 Recurring
                  </button>
                  <button
                    type="button"
                    onClick={() => setSiloType('one-time')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                      siloType === 'one-time'
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
                        : 'bg-slate-800/50 text-muted-foreground hover:bg-slate-700/50'
                    }`}
                  >
                    📋 One-time
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {siloType === 'recurring'
                    ? 'For habits that repeat daily, weekly, or monthly'
                    : 'For tasks like meetings, assignments, or one-off goals'}
                </p>
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              >
                {initialData ? 'Save Changes' : 'Create Silo'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}