"use client";

import { useState } from "react";
import type { AdminStudent, UpdateStudentPayload } from "@/lib/types/admin";
import type { EducationalStage } from "@/lib/types/educational-content";

interface EditStudentModalProps {
  open: boolean;
  student: AdminStudent | null;
  stages: EducationalStage[];
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (studentId: string, payload: UpdateStudentPayload) => void;
}

function stageIdOf(student: AdminStudent | null): string {
  if (!student?.stage) return "";
  if (typeof student.stage === "object") return String(student.stage._id);
  return String(student.stage);
}

const INPUT_CLASS =
  "w-full h-[48px] rounded-xl border-[1.5px] border-border px-4 text-text-main text-[14px] outline-none focus:border-primary transition-colors bg-background focus:bg-surface";

export default function EditStudentModal({
  open,
  student,
  stages,
  saving,
  error,
  onClose,
  onSave,
}: EditStudentModalProps) {
  const [name, setName] = useState(student?.name ?? "");
  const [phoneNumber, setPhoneNumber] = useState(student?.phoneNumber ?? "");
  const [address, setAddress] = useState(student?.address ?? "");
  const [stage, setStage] = useState(stageIdOf(student));
  const [avatar, setAvatar] = useState(student?.avatar ?? "");
  const [password, setPassword] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName(student?.name ?? "");
      setPhoneNumber(student?.phoneNumber ?? "");
      setAddress(student?.address ?? "");
      setStage(stageIdOf(student));
      setAvatar(student?.avatar ?? "");
      setPassword("");
    }
  }

  if (!open || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student.studentId) return;
    const payload: UpdateStudentPayload = {
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      avatar: avatar.trim(),
    };
    if (stage) payload.stage = stage;
    if (password.trim()) payload.password = password.trim();
    onSave(student.studentId, payload);
  };

  return (
    <div
      className="fixed inset-0 z-[2100] flex items-end sm:items-center justify-center bg-black/40 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full sm:max-w-[520px] max-h-[90vh] overflow-y-auto bg-surface rounded-t-[20px] sm:rounded-b-[20px] border border-border p-6 md:p-8 shadow-2xl"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[20px] font-extrabold text-text-main mb-6 text-center">تعديل بيانات الطالب</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">الاسم</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLASS} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">رقم الهاتف</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="01xxxxxxxxx"
              className={INPUT_CLASS}
              dir="ltr"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">العنوان</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={INPUT_CLASS} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">المرحلة الدراسية</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className={`${INPUT_CLASS} appearance-none cursor-pointer`}
            >
              <option value="">بدون مرحلة</option>
              {stages.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.title}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-text-muted">
              تعيين المرحلة يسمح بإدارة اشتراكات أشهر هذه المرحلة.
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">رابط الصورة الرمزية</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className={INPUT_CLASS}
              dir="ltr"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-semibold text-text-main">كلمة مرور جديدة (اختياري)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="اتركها فارغة لعدم التغيير"
              className={INPUT_CLASS}
              dir="ltr"
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
