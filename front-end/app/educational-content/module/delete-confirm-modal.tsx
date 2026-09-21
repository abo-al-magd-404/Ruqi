"use client";

interface DeleteConfirmModalProps {
  open: boolean;
  deleteMessage: string;
  deleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  open,
  deleteMessage,
  deleting,
  error,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-2000 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => {
        if (!deleting) onClose();
      }}
    >
      <div
        className="w-full max-w-100 bg-surface rounded-[20px] border border-border p-6 shadow-2xl"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[18px] font-extrabold text-text-main mb-2 text-center">
          تأكيد الحذف
        </h3>
        <p className="text-[14px] text-text-muted font-medium text-center mb-6 leading-relaxed">
          {deleteMessage}
        </p>

        {error && (
          <p className="text-sm text-danger bg-danger-bg border border-danger rounded-lg p-3 mb-4 text-center font-medium">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 h-11.5 bg-transparent border border-border text-text-muted font-bold text-[14px] rounded-xl hover:bg-surface-secondary transition-colors disabled:opacity-60"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 h-11.5 bg-danger text-white font-bold text-[14px] rounded-xl hover:bg-danger-hover transition-colors disabled:opacity-60"
          >
            {deleting ? "جاري الحذف..." : "حذف"}
          </button>
        </div>
      </div>
    </div>
  );
}
