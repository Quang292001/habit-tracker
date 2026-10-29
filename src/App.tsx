import { useCallback, useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import Analytics from './components/Analytics';
import Calendar from './components/Calendar';
import HabitForm from './components/HabitForm';
import MissedBanner from './components/MissedBanner';
import Toast, { type ToastData } from './components/Toast';
import TodayList, { type CategoryFilter } from './components/TodayList';
import { useLocalStorage } from './hooks/useLocalStorage';
import { addDays, formatLong, greeting, todayISO } from './lib/date';
import { dayRatio, missedYesterday, seedHabits, skipDay, toggleDone, uid } from './lib/habits';
import type { Habit, HabitInput } from './types';

export default function App() {
  const today = todayISO();
  const [habits, setHabits] = useLocalStorage<Habit[]>('habit-tracker:v1', () => seedHabits(today));
  const [selected, setSelected] = useState(today);
  const [form, setForm] = useState<{ editing: Habit | null } | null>(null);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [toast, setToast] = useState<ToastData | null>(null);
  const closeToast = useCallback(() => setToast(null), []);
  const showToast = (message: string, undo: () => void) => setToast({ id: Date.now(), message, undo });
  // Nếu mục đang lọc không còn thói quen nào (vừa xóa/đổi lĩnh vực) thì tự quay về "Tất cả"
  const activeCategory: CategoryFilter =
    category === 'all' || habits.some((h) => h.category === category) ? category : 'all';

  const update = (id: string, fn: (h: Habit) => Habit) => setHabits((hs) => hs.map((h) => (h.id === id ? fn(h) : h)));
  const yesterday = addDays(today, -1);

  const save = (input: HabitInput) => {
    const editing = form?.editing;
    if (editing) update(editing.id, (h) => ({ ...h, ...input }));
    else setHabits((hs) => [...hs, { ...input, id: uid(), done: [], skipped: [], createdAt: today }]);
    setForm(null);
  };

  const remove = (h: Habit) => {
    const index = habits.findIndex((x) => x.id === h.id);
    setHabits((hs) => hs.filter((x) => x.id !== h.id));
    showToast(`Đã xóa “${h.name}”`, () =>
      setHabits((hs) => {
        if (hs.some((x) => x.id === h.id)) return hs;
        const next = [...hs];
        next.splice(Math.min(index, next.length), 0, h); // trả về đúng vị trí cũ
        return next;
      }),
    );
  };

  const reset = () => {
    const previous = habits;
    setHabits(seedHabits(today));
    showToast('Đã đặt lại về dữ liệu mẫu', () => setHabits(previous));
  };

  const todayPct = Math.round(dayRatio(habits, today) * 100);

  return (
    <div className="shell">
      <div className="layout">
        <aside className="side">
          <div>
            <p className="muted">{formatLong(today)}</p>
            <h1>{greeting()} 👋</h1>
            <p className="muted">Hôm nay bạn đã hoàn thành <b>{todayPct}%</b> thói quen.</p>
          </div>
          <button type="button" className="btn btn--lg" onClick={() => setForm({ editing: null })}>
            <Plus size={18} /> Thói quen mới
          </button>
          <Calendar habits={habits} today={today} selected={selected} onSelect={setSelected} />
        </aside>

        <main className="main">
          <MissedBanner
            habits={missedYesterday(habits, today)}
            onMakeUp={(id) => update(id, (h) => toggleDone(h, yesterday))}
            onSkip={(id) => update(id, (h) => skipDay(h, yesterday))}
          />
          <TodayList
            habits={habits}
            date={selected}
            today={today}
            category={activeCategory}
            onCategory={setCategory}
            onToggle={(id) => update(id, (h) => toggleDone(h, selected))}
            onSkip={(id) => update(id, (h) => skipDay(h, selected))}
            onEdit={(h) => setForm({ editing: h })}
            onDelete={remove}
          />
        </main>

        <Analytics habits={habits} today={today} />
      </div>

      <footer className="foot">
        <span>Dữ liệu được lưu ngay trên trình duyệt của bạn (localStorage), không gửi đi đâu.</span>
        <button type="button" className="link" onClick={reset}><RotateCcw size={13} /> Đặt lại dữ liệu mẫu</button>
      </footer>

      <Toast toast={toast} onClose={closeToast} />
      {form && <HabitForm editing={form.editing} habits={habits} onSave={save} onClose={() => setForm(null)} />}
    </div>
  );
}
