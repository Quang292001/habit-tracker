import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { CATEGORIES, type Category, type Habit, type HabitInput } from '../types';
import { validate, type FormErrors } from '../lib/habits';

const EMOJIS = ['📚', '🎧', '💻', '✍️', '🎨', '🏃', '🧘', '💧'];

interface Props {
  editing: Habit | null;
  habits: Habit[];
  onSave: (input: HabitInput) => void;
  onClose: () => void;
}

export default function HabitForm({ editing, habits, onSave, onClose }: Props) {
  const [form, setForm] = useState<HabitInput>(
    editing
      ? { name: editing.name, emoji: editing.emoji, category: editing.category, time: editing.time, goalPerWeek: editing.goalPerWeek }
      : { name: '', emoji: '📚', category: 'TOEIC', time: '', goalPerWeek: 5 },
  );
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = <K extends keyof HabitInput>(k: K, v: HabitInput[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form, habits, editing?.id);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSave({ ...form, name: form.name.trim() });
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title" onSubmit={submit} noValidate>
        <header>
          <h2 id="form-title">{editing ? 'Sửa thói quen' : 'Thói quen mới'}</h2>
          <button type="button" className="icon-btn" aria-label="Đóng" onClick={onClose}><X size={18} /></button>
        </header>

        <label className="field">
          <span>Tên thói quen</span>
          <input autoFocus value={form.name} maxLength={50} placeholder="VD: Luyện nghe TOEIC 20 phút"
            aria-invalid={!!errors.name} onChange={(e) => set('name', e.target.value)} />
          {errors.name && <em role="alert">{errors.name}</em>}
        </label>

        <div className="field">
          <span>Biểu tượng</span>
          <div className="emojis">
            {EMOJIS.map((em) => (
              <button type="button" key={em} className={form.emoji === em ? 'is-on' : ''} aria-pressed={form.emoji === em} onClick={() => set('emoji', em)}>{em}</button>
            ))}
          </div>
        </div>

        <div className="row">
          <label className="field">
            <span>Lĩnh vực</span>
            <select value={form.category} onChange={(e) => set('category', e.target.value as Category)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Giờ nhắc (tùy chọn)</span>
            <input type="time" value={form.time} aria-invalid={!!errors.time} onChange={(e) => set('time', e.target.value)} />
            {errors.time && <em role="alert">{errors.time}</em>}
          </label>
        </div>

        <label className="field">
          <span>Mục tiêu: <b>{form.goalPerWeek}</b> buổi / tuần</span>
          <input type="range" min={1} max={7} value={form.goalPerWeek} onChange={(e) => set('goalPerWeek', Number(e.target.value))} />
          {errors.goalPerWeek && <em role="alert">{errors.goalPerWeek}</em>}
        </label>

        <footer>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Hủy</button>
          <button type="submit" className="btn">{editing ? 'Lưu thay đổi' : 'Tạo thói quen'}</button>
        </footer>
      </form>
    </div>
  );
}
