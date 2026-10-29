import type { Habit } from '../types';
import { fromISO } from '../lib/date';
import { dayRatio, lastDays, streak, weekCount } from '../lib/habits';

const DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function Analytics({ habits, today }: { habits: Habit[]; today: string }) {
  const days = lastDays(habits, today, 7);
  const rate = Math.round((days.reduce((s, d) => s + dayRatio(habits, d.date), 0) / days.length) * 100);
  const best = habits.reduce((m, h) => Math.max(m, streak(h, today)), 0);

  return (
    <section className="analytics" aria-label="Tiến độ">
      <h2>Tiến độ</h2>
      <div className="stats">
        <div className="stat stat--green"><span>Tỉ lệ 7 ngày qua</span><strong>{rate}%</strong></div>
        <div className="stat stat--dark"><span>Chuỗi dài nhất</span><strong>{best} ngày</strong></div>
      </div>

      <div className="card">
        <h3>Hoàn thành theo ngày</h3>
        <div className="bars" role="img" aria-label="Biểu đồ số thói quen hoàn thành 7 ngày gần nhất">
          {days.map((d) => (
            <div className="bar" key={d.date}>
              <span className="bar__val">{d.done}</span>
              <div className="bar__track">
                <div className={`bar__fill${d.date === today ? ' is-today' : ''}`} style={{ height: `${d.total ? (d.done / d.total) * 100 : 0}%` }} />
              </div>
              <span className="bar__label">{DOW[fromISO(d.date).getDay()]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Mục tiêu tuần này</h3>
        {habits.length === 0 && <p className="empty">Chưa có dữ liệu.</p>}
        <ul className="goals">
          {habits.map((h) => {
            const c = weekCount(h, today);
            const pct = Math.min(100, (c / h.goalPerWeek) * 100);
            return (
              <li key={h.id}>
                <div><span>{h.emoji} {h.name}</span><span className="muted">{c}/{h.goalPerWeek}</span></div>
                <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={h.goalPerWeek} aria-valuenow={c}>
                  <i className={c >= h.goalPerWeek ? 'is-complete' : ''} style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
