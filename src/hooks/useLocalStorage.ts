import { useEffect, useState } from 'react';

/** useState nhưng tự đọc/ghi localStorage. Bọc try/catch vì có thể bị chặn (chế độ riêng tư, hết dung lượng). */
export function useLocalStorage<T>(key: string, initial: () => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      /* dữ liệu hỏng → dùng giá trị khởi tạo */
    }
    return initial();
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* bỏ qua */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
