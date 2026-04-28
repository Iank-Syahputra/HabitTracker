'use client';

import { useMemo } from 'react';

interface HeatmapDay {
  date: string;
  count: number;
  max: number;
}

interface HeatmapProps {
  data: HeatmapDay[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getLevel(count: number, max: number): number {
  if (max === 0 || count === 0) return 0;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function getColor(level: number): string {
  const colors = ['#1e293b', '#1e3a5f', '#6366f1', '#10b981', '#34d399'];
  return colors[level];
}

export function ContributionHeatmap({ data }: HeatmapProps) {
  const { weeks, maxCount } = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364);
    
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }
    
    const dataMap = new Map(data.map(d => [d.date, d.count]));
    const max = Math.max(...data.map(d => d.count), 1);
    
    const weeks: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const count = dataMap.get(dateStr) || 0;
      
      currentWeek.push({ date: dateStr, count, max });
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return { weeks, maxCount: max };
  }, [data]);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: getColor(level) }}
            />
          ))}
          <span>More</span>
        </div>
        
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 pr-2 text-xs text-muted-foreground">
            {DAYS.map((day, i) => (
              <div key={day} className="h-3 leading-3">
                {i % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>
          
          <div className="flex gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.count} tasks`}
                    className="h-3 w-3 rounded-sm transition-all hover:ring-2 hover:ring-emerald-500/50"
                    style={{ backgroundColor: getColor(getLevel(day.count, maxCount)) }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}