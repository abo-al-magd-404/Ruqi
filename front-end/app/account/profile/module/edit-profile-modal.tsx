import { useState } from "react";
import type { EducationalStage } from "@/lib/types/educational-content";
import AvatarPicker from "../../module/AvatarPicker";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  form: {
    name: string;
    phoneNumber: string;
    address: string;
    stage: string;
    avatar: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  error: string | null;
  stages: EducationalStage[];
  initialSection?: "data" | "avatar";
}

export default function EditProfileModal({
  open,
  onClose,
  form,
  onChange,
  onSubmit,
  saving,
  error,
  stages,
  initialSection = "data",
}: EditProfileModalProps) {
  const [section, setSection] = useState<"data" | "avatar">(initialSection);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSection(initialSection);
    }
  }

  if (!open) return null;

  const commitAvatar = (avatar: string) => {
    onChange({
      target: { name: "avatar", value: avatar },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div
      className="fixed inset-0 z-2000 flex items-end sm:items-center justify-center bg-black/40 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full sm:max-w-120 bg-surface rounded-t-[20px] sm:rounded-b-[20px] border border-border p-6 md:p-8 shadow-2xl max-h-[85vh] overflow-y-auto"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[20px] font-extrabold text-text-main mb-6 text-center">
          تعديل المعلومات
        </h3>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2 p-1 bg-surface-secondary rounded-xl">
            <button
              type="button"
              onClick={() => setSection("data")}
              className={`flex-1 h-10.5 rounded-lg font-bold text-[14px] transition-colors ${
                section === "data"
                  ? "bg-primary text-text-main"
                  : "text-text-muted hover:bg-surface"
              }`}
            >
              البيانات
            </button>
            <button
              type="button"
              onClick={() => setSection("avatar")}
              className={`flex-1 h-10.5 rounded-lg font-bold text-[14px] transition-colors ${
                section === "avatar"
                  ? "bg-primary text-text-main"
                  : "text-text-muted hover:bg-surface"
              }`}
            >
              الصورة الرمزية
            </button>
          </div>

          {section === "avatar" && (
            <AvatarPicker
              key={form.avatar}
              value={form.avatar}
              fallbackName={form.name}
              onChange={commitAvatar}
            />
          )}

          {section === "data" && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-text-main">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="w-full h-12 rounded-xl border-[1.5px] border-border px-4 text-text-main text-[14px] outline-none focus:border-primary transition-colors bg-background focus:bg-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-text-main">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={onChange}
                  placeholder="01xxxxxxxxx"
                  className="w-full h-12 rounded-xl border-[1.5px] border-border px-4 text-text-main text-[14px] outline-none focus:border-primary transition-colors bg-background focus:bg-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-text-main">
                  العنوان
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  className="w-full h-12 rounded-xl border-[1.5px] border-border px-4 text-text-main text-[14px] outline-none focus:border-primary transition-colors bg-background focus:bg-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-text-main">
                  المرحلة الدراسية
                </label>
                <select
                  name="stage"
                  value={form.stage}
                  disabled
                  className="w-full h-12 rounded-xl border-[1.5px] border-border px-4 text-text-muted text-[14px] outline-none bg-background cursor-not-allowed appearance-none"
                >
                  <option value="" disabled>
                    اختر المرحلة
                  </option>
                  {stages.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.title}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-text-muted">
                  لتغيير المرحلة الدراسية يرجى التواصل مع إدارة المنصة.
                </span>
              </div>
            </>
          )}

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
              className="flex-1 h-12 bg-transparent border border-border text-text-muted font-bold text-[14px] rounded-xl hover:bg-surface-secondary transition-colors disabled:opacity-60"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-12 bg-primary text-text-main font-bold text-[14px] rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-60"
            >
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
