const pad = (n: number) => String(n).padStart(2, '0');

export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const todayISO = () => toISO(new Date());
export const addDays = (s: string, n: number) => {
  const d = fromISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
};
/** Thứ Hai đầu tuần của ngày s */
export const startOfWeek = (s: string) => addDays(s, -((fromISO(s).getDay() + 6) % 7));

/** Lưới tháng bắt đầu từ Thứ Hai; ô đầu tháng trống là null */
export const monthGrid = (y: number, m: number): (string | null)[] => {
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= days; d++) cells.push(toISO(new Date(y, m, d)));
  return cells;
};

export const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
export const formatLong = (s: string) =>
  new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }).format(fromISO(s));
export const formatShort = (s: string) => `${fromISO(s).getDate()}/${fromISO(s).getMonth() + 1}`;
export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Chào buổi sáng' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
};
