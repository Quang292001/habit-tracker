import { HeartHandshake } from 'lucide-react';
import type { Habit } from '../types';

interface Props {
  habits: Habit[];
  onMakeUp: (id: string) => void;
  onSkip: (id: string) => void;
}

/** Xử lý khi bỏ lỡ: không phán xét, đưa 2 lựa chọn rõ ràng — làm bù hoặc chủ động bỏ qua (giữ chuỗi). */
export default function MissedBanner({ habits, onMakeUp, onSkip }: Props) {
  if (habits.length === 0) return null;
  return (
    <section className="missed" role="status" aria-label="Thói quen bị bỏ lỡ hôm qua">
      <div className="missed__title">
        <HeartHandshake size={20} />
        <div>
          <strong>Hôm qua bạn chưa kịp làm {habits.length} thói quen</strong>
          <p>Không sao cả. Quy tắc nhỏ: đừng bỏ lỡ hai ngày liên tiếp. Chọn cách phù hợp nhất:</p>
        </div>
      </div>
      <ul>
        {habits.map((h) => (
          <li key={h.id}>
            <span>{h.emoji} {h.name}</span>
            <div>
              <button type="button" className="btn btn--sm" onClick={() => onMakeUp(h.id)}>Làm bù hôm qua</button>
              <button type="button" className="btn btn--sm btn--ghost" onClick={() => onSkip(h.id)}>Bỏ qua, giữ chuỗi</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
