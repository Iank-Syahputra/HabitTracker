'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { ICON_NAMES, getIcon, type IconKey } from '@/utils/icons';
import type { Silo } from '@/types';

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#ec4899'
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
  const [iconOpen, setIconOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), icon, color_theme: color });
    setName('');
    setIcon('star');
    setColor('#6366f1');
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
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-4 right-4 top-1/2 z-50 -translate-y-1/2 rounded-2xl bg-card p-6 shadow-xl md:left-1/2 md:right-auto md:w-full md:max-w-md md:translate-x-[-50%]"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {initialData ? 'Edit Silo' : 'New Silo'}
              </h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Maintenance Motor"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Icon</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIconOpen(!iconOpen)}
                    className="flex w-full items-center justify-between rounded-xl border border-input bg-background px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <SelectedIcon className="h-5 w-5" style={{ color }} />
                      <span className="capitalize">{icon}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${iconOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {iconOpen && (
                    <div className="absolute z-10 mt-2 grid max-h-48 w-full grid-cols-5 gap-2 overflow-auto rounded-xl border border-input bg-background p-3 shadow-lg">
                      {ICON_NAMES.map((iconKey) => {
                        const IconComp = getIcon(iconKey as IconKey);
                        return (
                          <button
                            key={iconKey}
                            type="button"
                            onClick={() => { setIcon(iconKey); setIconOpen(false); }}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                              icon === iconKey ? 'bg-primary/20' : 'hover:bg-muted'
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
                <label className="mb-2 block text-sm font-medium">Color</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setColorOpen(!colorOpen)}
                    className="flex w-full items-center justify-between rounded-xl border border-input bg-background px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full" style={{ backgroundColor: color }} />
                      <span>{color}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${colorOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {colorOpen && (
                    <div className="absolute z-10 mt-2 grid max-h-48 w-full grid-cols-6 gap-2 overflow-auto rounded-xl border border-input bg-background p-3 shadow-lg">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { setColor(c); setColorOpen(false); }}
                          className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                            color === c ? 'ring-2 ring-ring ring-offset-2 ring-offset-background' : ''
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

              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
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