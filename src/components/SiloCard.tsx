'use client';

import { motion } from 'framer-motion';
import { getIcon, type IconKey } from '@/utils/icons';
import type { SiloWithProgress } from '@/types';

interface SiloCardProps {
  silo: SiloWithProgress;
  onClick: () => void;
  onLongPress?: () => void;
}

export function SiloCard({ silo, onClick, onLongPress }: SiloCardProps) {
  const Icon = getIcon(silo.icon as IconKey);
  
  const progressColor = silo.color_theme;
  const isEmerald = progressColor === '#10B981';
  const isIndigo = progressColor === '#6366F1';
  
  const innerGlowClass = isEmerald ? 'inner-glow-emerald' : isIndigo ? 'inner-glow-indigo' : '';
  
  const handleContextMenu = (e: React.MouseEvent) => {
    if (onLongPress) {
      e.preventDefault();
      onLongPress();
    }
  };
  
  const handleHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      onClick={() => {
        onClick();
        handleHaptic();
      }}
      onContextMenu={handleContextMenu}
      className={`glass-card glass-card-hover relative cursor-pointer overflow-hidden rounded-2xl border p-5 transition-all ${silo.progress === 100 ? 'victory-animation' : ''} ${innerGlowClass}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${progressColor}30` }}
        >
          <Icon className="h-6 w-6" style={{ color: progressColor }} />
        </div>
        {silo.progress === 100 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30"
          >
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </div>
      
      <h3 className="mb-1 text-lg font-semibold text-foreground">{silo.name}</h3>
      <p className="text-sm text-muted-foreground font-mono">
        {silo.completedCount}/{silo.totalCount} tasks completed
      </p>
      
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800/50">
        <motion.div
          className={`h-full rounded-full ${silo.progress > 80 ? 'progress-pulse' : ''}`}
          style={{ 
            background: `linear-gradient(90deg, #6366F1, #10B981)` 
          }}
          initial={{ width: 0 }}
          animate={{ width: `${silo.progress}%` }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      
      <p className="mt-2 text-right text-xs font-mono font-semibold" style={{ color: progressColor }}>
        {silo.progress}%
      </p>
    </motion.div>
  );
}