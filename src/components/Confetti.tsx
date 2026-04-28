'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  trigger: boolean;
}

export function Confetti({ trigger }: ConfettiProps) {
  const ref = useRef<confetti.CreateTypes | null>(null);

  useEffect(() => {
    if (trigger) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#3b82f6', '#6366f1', '#8b5cf6'],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#3b82f6', '#6366f1', '#8b5cf6'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  }, [trigger]);

  return null;
}