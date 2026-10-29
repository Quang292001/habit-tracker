import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Habit } from '../types';
import { WEEKDAYS, fromISO, monthGrid } from '../lib/date';
import { dayRatio } from '../lib/habits';

const R = 15;
const C = 2 * Math.PI * R;

interface Props {
  habits: Habit[];
  today: string;
  selected: string;
  onSelect: (d: string) => void;
}

export default function Calendar({ habits, today, selected, onSelect }: Props) {
  const [view, setView] = useState(() => ({ y: fromISO(selected).getFullYear(), m: fromISO(selected).getMonth() }));
  const shift = (n: number) =>
    setView(({ y, m }) => {
      const d = new Date(y, m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <section className="calendar" aria-label="Lịch thói quen">
      <header className="calendar__head">
        <h2>Tháng {view.m + 1}, {view.y}</h2>
        <div className="calendar__nav">
          <button type="button" aria-label="Tháng trước" onClick={() => shift(-1)}><ChevronLeft size={16} /></button>
          <button type="button" aria-label="Tháng sau" onClick={() => shift(1)}><ChevronRight size={16} /></button>
        </div>
      </header>
      <div className="calendar__grid">
        {WEEKDAYS.map((w) => <span className="calendar__dow" key={w}>{w}</span>)}
        {monthGrid(view.y, view.m).map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const ratio = dayRatio(habits, d);
          const future = d > today;
          const cls = ['day', d === selected && 'is-selected', d === today && 'is-today', future && 'is-future']
            .filter(Boolean).join(' ');
          return (
            <button
              key={d}
              type="button"
              className={cls}
              disabled={future}
              aria-label={`Ngày ${fromISO(d).getDate()}, hoàn thành ${Math.round(ratio * 100)}%`}
              aria-pressed={d === selected}
              onClick={() => onSelect(d)}
            >
              <svg viewBox="0 0 36 36" aria-hidden="true">
                <circle className="ring-bg" cx="18" cy="18" r={R} />
                {ratio > 0 && (
                  <circle className="ring" cx="18" cy="18" r={R} strokeDasharray={`${ratio * C} ${C}`} transform="rotate(-90 18 18)" />
                )}
              </svg>
              <span>{fromISO(d).getDate()}</span>
            </button>
          );
        })}
      </div>
      <p className="calendar__legend">Vòng cam = tỉ lệ thói quen đã hoàn thành trong ngày.</p>
    </section>
  );
}
