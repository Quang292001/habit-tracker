export type Category = 'TOEIC' | 'Lập trình' | 'Thiết kế' | 'Khác';
export const CATEGORIES: Category[] = ['TOEIC', 'Lập trình', 'Thiết kế', 'Khác'];

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  category: Category;
  time: string; // "HH:mm" hoặc rỗng
  goalPerWeek: number; // 1–7
  done: string[]; // các ngày đã hoàn thành (YYYY-MM-DD)
  skipped: string[]; // các ngày chủ động bỏ qua: không cộng chuỗi nhưng không làm đứt chuỗi
  createdAt: string;
}

export type HabitInput = Pick<Habit, 'name' | 'emoji' | 'category' | 'time' | 'goalPerWeek'>;
