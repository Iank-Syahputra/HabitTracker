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
  
  const bgColor = `${silo.color_theme}15`;
  const borderColor = `${silo.color_theme}40`;
  const progressColor = silo.color_theme;

  const handleContextMenu = (e: React.MouseEvent) => {
    if (onLongPress) {
      e.preventDefault();
      onLongPress();
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      onContextMenu={handleContextMenu}
      className="relative cursor-pointer overflow-hidden rounded-2xl border-2 p-5 transition-all"
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
      }}
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
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22c55e]"
          >
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </div>
      
      <h3 className="mb-1 text-lg font-semibold text-foreground">{silo.name}</h3>
      <p className="text-sm text-muted-foreground">
        {silo.completedCount}/{silo.totalCount} tasks completed
      </p>
      
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: progressColor }}
          initial={{ width: 0 }}
          animate={{ width: `${silo.progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      
      <p className="mt-2 text-right text-xs font-medium" style={{ color: progressColor }}>
        {silo.progress}%
      </p>
    </motion.div>
  );
}