import { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ToastData {
  id: number;
  message: string;
  undo: () => void;
}

/** Thông báo nhỏ có nút Hoàn tác, tự ẩn sau 6 giây. Thay cho hộp xác nhận chặn giao diện. */
export default function Toast({ toast, onClose }: { toast: ToastData | null; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{toast.message}</span>
      <button type="button" className="toast__undo" onClick={() => { toast.undo(); onClose(); }}>Hoàn tác</button>
      <button type="button" aria-label="Đóng thông báo" onClick={onClose}><X size={14} /></button>
    </div>
  );
}
