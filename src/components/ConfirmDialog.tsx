'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-4 right-4 top-1/2 z-50 -translate-y-1/2 rounded-2xl glass-card border border-white/10 p-6 shadow-xl md:left-1/2 md:right-auto md:w-full md:max-w-sm md:translate-x-[-50%]"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
                variant === 'danger' ? 'bg-red-500/20' : 'bg-yellow-500/20'
              }`}>
                <AlertTriangle className={`h-7 w-7 ${
                  variant === 'danger' ? 'text-red-500' : 'text-yellow-500'
                }`} />
              </div>
              
              <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mb-6 text-sm text-muted-foreground">{message}</p>
              
              <div className="flex w-full gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 font-medium text-foreground transition-all hover:bg-slate-700/50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 rounded-xl px-4 py-3 font-medium text-white transition-all ${
                    variant === 'danger' 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25' 
                      : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:shadow-lg hover:shadow-yellow-500/25'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}