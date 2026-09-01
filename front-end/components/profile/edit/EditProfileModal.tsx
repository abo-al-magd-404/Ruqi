interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  form: { name: string; phoneNumber: string; address: string; educationalStage: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  error: string | null;
}

export default function EditProfileModal({
  open,
  onClose,
  form,
  onChange,
  onSubmit,
  saving,
  error,
}: EditProfileModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/40 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full sm:max-w-[480px] bg-surface rounded-t-[20px] sm:rounded-b-[20px] border border-border p-6 md:p-8 shadow-2xl"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[20px] font-extrabold text-text-main mb-6 text-center">تعديل المعلومات</h3>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">الاسم الكامل</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full h-[48px] rounded-xl border-[1.5px] border-border px-4 text-text-main text-[14px] outline-none focus:border-primary transition-colors bg-background focus:bg-surface"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">رقم الهاتف</label>
            <input
              type="tel"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={onChange}
              placeholder="01xxxxxxxxx"
              className="w-full h-[48px] rounded-xl border-[1.5px] border-border px-4 text-text-main text-[14px] outline-none focus:border-primary transition-colors bg-background focus:bg-surface"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">العنوان</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={onChange}
              className="w-full h-[48px] rounded-xl border-[1.5px] border-border px-4 text-text-main text-[14px] outline-none focus:border-primary transition-colors bg-background focus:bg-surface"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">المرحلة الدراسية</label>
            <input
              type="text"
              name="educationalStage"
              value={form.educationalStage}
              onChange={onChange}
              className="w-full h-[48px] rounded-xl border-[1.5px] border-border px-4 text-text-main text-[14px] outline-none focus:border-primary transition-colors bg-background focus:bg-surface"
            />
          </div>

          {error && (
            <p className="text-sm text-danger bg-danger-bg border border-danger rounded-lg p-3 text-center font-medium">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 h-[48px] bg-transparent border border-border text-text-muted font-bold text-[14px] rounded-xl hover:bg-surface-secondary transition-colors disabled:opacity-60"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-[48px] bg-primary text-text-main font-bold text-[14px] rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-60"
            >
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}