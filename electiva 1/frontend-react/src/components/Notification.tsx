interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export default function Notification({ message, type = 'info', onClose }: NotificationProps) {
  if (!message) return null;
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200'
  }[type];

  return (
    <div className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${styles}`}>
      <span>{message}</span>
      {onClose && <button onClick={onClose} className="ml-3 font-semibold">Cerrar</button>}
    </div>
  );
}
