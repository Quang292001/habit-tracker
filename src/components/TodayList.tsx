import { Check, Flame, Pencil, SkipForward, Trash2 } from 'lucide-react';
import { CATEGORIES, type Category, type Habit } from '../types';
import { WEEKDAYS, addDays, formatLong, startOfWeek } from '../lib/date';
import { isActive, isDone, isSkipped, streak, weekCount } from '../lib/habits';

export type CategoryFilter = 'all' | Category;

interface Props {
  habits: Habit[];
  date: string;
  today: string;
  category: CategoryFilter;
  onCategory: (c: CategoryFilter) => void;
  onToggle: (id: string) => void;
  onSkip: (id: string) => void;
  onEdit: (h: Habit) => void;
  onDelete: (h: Habit) => void;
}

/** 7 chấm T2→CN của tuần hiện tại: xanh = đã làm, viền đứt = bỏ qua, vòng cam = hôm nay */
function WeekDots({ habit, today }: { habit: Habit; today: string }) {
  const start = startOfWeek(today);
  const n = weekCount(habit, today);
  return (
    <span className="dots" role="img" aria-label={`Tuần này: ${n}/${habit.goalPerWeek} buổi`}>
      {Array.from({ length: 7 }, (_, i) => {
        const d = addDays(start, i);
        const cls = [isDone(habit, d) && 'is-done', isSkipped(habit, d) && 'is-skipped', d === today && 'is-today', d > today && 'is-future']
          .filter(Boolean).join(' ');
        return <i key={d} title={WEEKDAYS[i]} className={cls} />;
      })}
      <small>{n}/{habit.goalPerWeek} tuần này</small>
    </span>
  );
}

export default function TodayList({ habits, date, today, category, onCategory, onToggle, onSkip, onEdit, onDelete }: Props) {
  const inDate = habits.filter((h) => isActive(h, date));
  const list = inDate
    .filter((h) => category === 'all' || h.category === category)
    .sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
  const done = list.filter((h) => isDone(h, date)).length;
  const future = date > today;
  const cats = CATEGORIES.filter((c) => habits.some((h) => h.category === c));

  return (
    <section className="card" aria-label="Danh sách thói quen">
      <header className="card__head">
        <h2>{date === today ? 'Hôm nay' : formatLong(date)}</h2>
        <span className="muted">{done}/{list.length} hoàn thành</span>
      </header>

      {cats.length > 1 && (
        <div className="chips" role="group" aria-label="Lọc theo lĩnh vực">
          {(['all', ...cats] as CategoryFilter[]).map((c) => (
            <button key={c} type="button" className={category === c ? 'is-on' : ''} aria-pressed={category === c} onClick={() => onCategory(c)}>
              {c === 'all' ? 'Tất cả' : c}
              <span>{c === 'all' ? inDate.length : inDate.filter((h) => h.category === c).length}</span>
            </button>
          ))}
        </div>
      )}

      {future && <p className="hint">Chưa tới ngày này nên chưa thể đánh dấu.</p>}
      {date < today && <p className="hint">Bạn đang xem ngày cũ — vẫn có thể đánh dấu làm bù.</p>}

      {list.length === 0 ? (
        <p className="empty">{habits.length === 0 ? 'Chưa có thói quen nào. Bấm “Thói quen mới” để bắt đầu.' : 'Không có thói quen nào trong mục này.'}</p>
      ) : (
        <ul className="todos">
          {list.map((h) => {
            const checked = isDone(h, date);
            const skipped = isSkipped(h, date);
            const s = streak(h, today);
            return (
              <li key={h.id} className={`todo${checked ? ' is-done' : ''}${skipped ? ' is-skipped' : ''}`}>
                <span className="todo__emoji" aria-hidden="true">{h.emoji}</span>
                <div className="todo__main">
                  <strong>{h.name}</strong>
                  <span className="muted">
                    {h.time ? `${h.time} · ` : ''}{h.category}{skipped ? ' · đã bỏ qua' : ''}
                  </span>
                  <WeekDots habit={h} today={today} />
                </div>
                {s > 0 && <span className="streak" title="Chuỗi ngày liên tiếp"><Flame size={14} />{s}</span>}
                <div className="todo__actions">
                  <button type="button" aria-label={`Sửa ${h.name}`} onClick={() => onEdit(h)}><Pencil size={15} /></button>
                  <button
                    type="button"
                    aria-label={skipped ? `Hủy bỏ qua ${h.name}` : `Bỏ qua ${h.name} ngày này`}
                    title={skipped ? 'Hủy bỏ qua' : 'Bỏ qua ngày này (giữ chuỗi)'}
                    aria-pressed={skipped}
                    disabled={future || checked}
                    onClick={() => onSkip(h.id)}
                  ><SkipForward size={15} /></button>
                  <button type="button" aria-label={`Xóa ${h.name}`} onClick={() => onDelete(h)}><Trash2 size={15} /></button>
                </div>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  aria-label={`Hoàn thành ${h.name}`}
                  className="check"
                  disabled={future}
                  onClick={() => onToggle(h.id)}
                >
                  {checked && <Check size={16} strokeWidth={3} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
