import type { Habit, HabitInput } from "../types";
import { addDays, startOfWeek } from "./date";

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const isDone = (h: Habit, d: string) => h.done.includes(d);
export const isSkipped = (h: Habit, d: string) => h.skipped.includes(d);
export const isActive = (h: Habit, d: string) => h.createdAt <= d;

const without = (arr: string[], d: string) => arr.filter((x) => x !== d);

export const toggleDone = (h: Habit, d: string): Habit =>
  isDone(h, d)
    ? { ...h, done: without(h.done, d) }
    : { ...h, done: [...h.done, d], skipped: without(h.skipped, d) };

/** Bật/tắt "bỏ qua" cho một ngày; bỏ qua thì đồng thời gỡ trạng thái đã làm. */
export const skipDay = (h: Habit, d: string): Habit =>
  isSkipped(h, d)
    ? { ...h, skipped: without(h.skipped, d) }
    : { ...h, skipped: [...h.skipped, d], done: without(h.done, d) };

/** Chuỗi ngày liên tiếp. Ngày bỏ qua không cộng nhưng không làm đứt chuỗi; hôm nay chưa làm cũng chưa đứt. */
export function streak(h: Habit, today: string): number {
  let count = 0;
  let d = today;
  for (let i = 0; i < 366; i++) {
    if (isDone(h, d)) count++;
    else if (!isSkipped(h, d) && d !== today) break;
    d = addDays(d, -1);
  }
  return count;
}

export function weekCount(h: Habit, today: string): number {
  const start = startOfWeek(today);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i)).filter((d) =>
    isDone(h, d),
  ).length;
}

export function dayRatio(habits: Habit[], d: string): number {
  const active = habits.filter((h) => isActive(h, d));
  return active.length
    ? active.filter((h) => isDone(h, d)).length / active.length
    : 0;
}

/** Thói quen bị bỏ lỡ hôm qua (trừ khi mục tiêu tuần đã đạt thì coi là ngày nghỉ hợp lý) */
export function missedYesterday(habits: Habit[], today: string): Habit[] {
  const y = addDays(today, -1);
  return habits.filter(
    (h) =>
      isActive(h, y) &&
      !isDone(h, y) &&
      !isSkipped(h, y) &&
      weekCount(h, today) < h.goalPerWeek,
  );
}

export function lastDays(habits: Habit[], today: string, n = 7) {
  return Array.from({ length: n }, (_, i) => {
    const date = addDays(today, i - (n - 1));
    const active = habits.filter((h) => isActive(h, date));
    return {
      date,
      done: active.filter((h) => isDone(h, date)).length,
      total: active.length,
    };
  });
}

export type FormErrors = Partial<
  Record<"name" | "goalPerWeek" | "time", string>
>;

export function validate(
  input: HabitInput,
  habits: Habit[],
  editingId?: string,
): FormErrors {
  const e: FormErrors = {};
  const name = input.name.trim();
  if (name.length < 2) e.name = "Tên cần ít nhất 2 ký tự.";
  else if (name.length > 40) e.name = "Tên tối đa 40 ký tự.";
  else if (
    habits.some(
      (h) => h.id !== editingId && h.name.toLowerCase() === name.toLowerCase(),
    )
  )
    e.name = "Bạn đã có thói quen trùng tên này.";
  if (
    !Number.isInteger(input.goalPerWeek) ||
    input.goalPerWeek < 1 ||
    input.goalPerWeek > 7
  )
    e.goalPerWeek = "Mục tiêu từ 1 đến 7 buổi mỗi tuần.";
  if (input.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time))
    e.time = "Giờ không hợp lệ.";
  return e;
}

/** Dữ liệu mẫu (tính theo ngày hiện tại) để lần đầu mở app không bị trống */
export function seedHabits(today: string): Habit[] {
  const base: Omit<Habit, "id" | "done" | "skipped" | "createdAt">[] = [
    {
      name: "Luyện nghe TOEIC Part 1–2",
      emoji: "🎧",
      category: "TOEIC",
      time: "06:30",
      goalPerWeek: 6,
    },
    {
      name: "Giải 1 bài thuật toán",
      emoji: "💻",
      category: "Lập trình",
      time: "20:00",
      goalPerWeek: 5,
    },
    {
      name: "Vẽ 1 màn hình UI",
      emoji: "🎨",
      category: "Thiết kế",
      time: "21:00",
      goalPerWeek: 4,
    },
    {
      name: "Học 10 từ vựng mới",
      emoji: "📚",
      category: "TOEIC",
      time: "",
      goalPerWeek: 7,
    },
  ];
  return base.map((b, idx) => {
    const done: string[] = [];
    for (let i = 0; i <= 30; i++) {
      if (i === 1) {
        // hôm qua: chỉ thói quen thứ 2 bị bỏ lỡ → banner gọn, có ví dụ rõ ràng
        if (idx !== 1) done.push(addDays(today, -1));
        continue;
      }
      if ((i * 7 + idx * 3) % 10 < 7 - idx) done.push(addDays(today, -i));
    }
    return {
      ...b,
      id: uid(),
      done,
      skipped: [],
      createdAt: addDays(today, -30),
    };
  });
}
