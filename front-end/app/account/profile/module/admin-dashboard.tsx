"use client";

// Admin dashboard rendered inside the profile page for ADMIN users. Provides the
// full student management UI: a searchable students table, a selected-student
// detail panel (stage, subscription ratio, account status), and a subscriptions
// section that toggles which months of the student's stage are active.
import { useState } from "react";
import { Search, Shield, Check, X } from "lucide-react";
import {
  studentStageTitle,
  studentSubscribedIds,
  useAdminDashboard,
} from "./use-admin-dashboard";
import EditStudentModal from "./edit-student-modal";
import type { AdminStudent, UserStatus } from "@/lib/types/admin";

// Human-readable labels + badge classes for each account status.
const STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: "نشط",
  PENDING: "قيد التفعيل",
  SUSPENDED: "موقوف",
};

const STATUS_CLASS: Record<UserStatus, string> = {
  ACTIVE: "bg-success-bg text-success",
  PENDING: "bg-warning-bg text-warning",
  SUSPENDED: "bg-danger-bg text-danger",
};

function ActionButton({
  type,
  label,
  onClick,
  disabled,
}: {
  type: "view" | "edit" | "delete";
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const styles = {
    view: "bg-primary-light text-text-main hover:bg-[#e8e2d8]",
    edit: "bg-primary-light text-primary hover:bg-[#f1ecd9]",
    delete: "bg-danger-bg text-danger hover:bg-[#ffd5d1]",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors disabled:opacity-50 ${styles[type]}`}
    >
      {label}
    </button>
  );
}

// Builds the admin dashboard UI; all state and mutations come from the shared
// useAdminDashboard hook, and the modal lifecycle lives here.
export default function AdminDashboard({
  adminName,
  adminEmail,
}: {
  adminName: string;
  adminEmail: string;
}) {
  const dash = useAdminDashboard();
  const [editing, setEditing] = useState<AdminStudent | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminStudent | null>(null);

  const selected = dash.selected;
  const subscribedIds = studentSubscribedIds(selected);
  // Share (0-100) of the selected stage's months the student is subscribed to.
  const subscriptionRatio =
    dash.stageMonths.length === 0
      ? 0
      : Math.round((subscribedIds.length / dash.stageMonths.length) * 100);

  const handleEditSave = async (studentId: string, payload: Parameters<typeof dash.saveStudent>[1]) => {
    const ok = await dash.saveStudent(studentId, payload);
    if (ok) setEditing(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete?.studentId) return;
    await dash.removeStudent(confirmDelete.studentId);
    setConfirmDelete(null);
  };

  return (
    <main className="w-full bg-background flex flex-col items-center px-4 py-8 md:px-[80px] md:py-[48px] font-cairo gap-10">
      {/* Header card identifying the logged-in admin. */}
      <section className="w-full max-w-[1280px] bg-surface border border-border rounded-[16px] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-light rounded-full flex justify-center items-center shrink-0">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-[18px] font-extrabold text-text-main leading-none">
              المدير: {adminName || "—"}
            </h1>
            <p className="text-[12px] font-normal text-text-muted">
              مستوى الصلاحيات: مدير عام المنصة • {adminEmail || "—"}
            </p>
          </div>
        </div>
        <div className="text-[14px] text-text-muted">لوحة إدارة الطلاب والاشتراكات</div>
      </section>

      {/* Stats cards: total students, active accounts, active subscriptions. */}
      <section className="w-full max-w-[1280px] grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border rounded-[16px] p-6 flex flex-col items-end text-right gap-2 shadow-sm transition-transform hover:-translate-y-1">
          <h3 className="text-[14px] font-bold text-primary">إجمالي الطلاب</h3>
          <span className="text-[32px] font-black text-text-main leading-none mt-1">
            {dash.students.length}
          </span>
          <p className="text-[13px] text-text-muted">طالب مسجل بالمنصة</p>
        </div>
        <div className="bg-surface border border-border rounded-[16px] p-6 flex flex-col items-end text-right gap-2 shadow-sm transition-transform hover:-translate-y-1">
          <h3 className="text-[14px] font-bold text-primary">الطلاب النشطون</h3>
          <span className="text-[32px] font-black text-text-main leading-none mt-1">
            {dash.activeCount}
          </span>
          <p className="text-[13px] text-text-muted">حساب بحالة نشط</p>
        </div>
        <div className="bg-surface border border-border rounded-[16px] p-6 flex flex-col items-end text-right gap-2 shadow-sm transition-transform hover:-translate-y-1">
          <h3 className="text-[14px] font-bold text-primary">الاشتراكات المفعلة</h3>
          <span className="text-[32px] font-black text-text-main leading-none mt-1">
            {dash.subscriptionsCount}
          </span>
          <p className="text-[13px] text-text-muted">اشتراك شهري نشط</p>
        </div>
      </section>

      {dash.error && (
        <div className="w-full max-w-[1280px] bg-danger-bg border border-danger text-danger font-bold text-[14px] rounded-xl p-4 text-center">
          {dash.error}
        </div>
      )}

      {/* Split layout: students table (with search) on the right, the selected
          student's detail panel as the left sidebar. */}
      <section className="w-full max-w-[1280px] flex flex-col lg:flex-row items-start gap-6">
        <aside className="w-full lg:w-[360px] bg-surface border-[1.5px] border-primary shadow-[0px_8px_24px_-2px_rgba(84,70,58,0.05)] rounded-[20px] p-6 flex flex-col gap-6 shrink-0">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <h2 className="text-[16px] font-extrabold text-text-main">تفاصيل ملف الطالب</h2>
            {selected && (
              <span className={`px-3 py-1 rounded-md text-[12px] font-bold ${STATUS_CLASS[selected.status]}`}>
                {STATUS_LABEL[selected.status]}
              </span>
            )}
          </div>

          {selected ? (
            <>
              <div className="flex flex-col items-center gap-4">
                <div className="w-[72px] h-[72px] rounded-full bg-background border border-border overflow-hidden flex items-center justify-center text-primary font-black text-[22px]">
                  {selected.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selected.avatar} alt={selected.name} className="w-full h-full object-cover" />
                  ) : (
                    selected.name.charAt(0)
                  )}
                </div>
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-[16px] font-extrabold text-text-main">{selected.name}</h3>
                  <p className="text-[12px] text-text-muted mt-1">{selected.email}</p>
                </div>
              </div>

              <div className="bg-background rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-text-muted">الرقم التعريفي</span>
                  <span className="text-[13px] font-bold text-primary" dir="ltr">
                    {selected.studentId || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-text-muted">المرحلة الدراسية</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-text-main">{studentStageTitle(selected)}</span>
                    {!selected.stage && (
                      <button
                        type="button"
                        onClick={() => setEditing(selected)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-primary-light text-primary hover:bg-[#f1ecd9] transition-colors"
                      >
                        تعيين المرحلة
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-text-muted">الاشتراكات المفعلة</span>
                  <span className="text-[14px] font-bold text-text-main">{subscribedIds.length}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <h4 className="text-[14px] font-bold text-text-main">نسبة تفعيل اشتراكات المرحلة</h4>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-text-muted w-10">{subscriptionRatio}٪</span>
                  <div className="flex-1 bg-primary-light rounded-full h-2 overflow-hidden flex" dir="ltr">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${subscriptionRatio}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="text-[14px] font-bold text-text-main">حالة الحساب</h4>
                <div className="flex flex-wrap gap-2">
                  {(["ACTIVE", "PENDING", "SUSPENDED"] as UserStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={dash.busy || selected.status === status}
                      onClick={() => selected.studentId && dash.changeStatus(selected.studentId, status)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors disabled:opacity-60 ${
                        selected.status === status
                          ? STATUS_CLASS[status]
                          : "bg-background border border-border text-text-muted hover:border-primary"
                      }`}
                    >
                      {STATUS_LABEL[status]}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-[14px] text-text-muted text-center py-10">اختر طالباً من القائمة لعرض تفاصيله</p>
          )}
        </aside>

        <div className="w-full flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-[22px] font-extrabold text-text-main">إدارة الطلاب والمستخدمين</h2>

            <div className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <Search className="w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={dash.search}
                onChange={(e) => dash.setSearch(e.target.value)}
                placeholder="بحث بالاسم أو رقم الطالب التعريفي أو البريد"
                className="flex-1 bg-transparent border-none outline-none text-[14px] text-text-main placeholder:text-text-muted"
              />
            </div>

            <div className="bg-surface border border-border rounded-[16px] overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full min-w-[800px] text-right">
                <thead className="bg-primary-light text-text-main text-[14px] font-bold border-b border-border">
                  <tr>
                    <th className="py-4 px-6 font-bold">رقم الطالب التعريفي</th>
                    <th className="py-4 px-6 font-bold">الاسم</th>
                    <th className="py-4 px-6 font-bold">البريد الإلكتروني</th>
                    <th className="py-4 px-6 font-bold">المرحلة</th>
                    <th className="py-4 px-6 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="text-[14px]">
                  {dash.loading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-text-muted font-bold">
                        جاري تحميل الطلاب...
                      </td>
                    </tr>
                  ) : dash.filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-text-muted font-bold">
                        لا يوجد طلاب مطابقون
                      </td>
                    </tr>
                  ) : (
                    dash.filteredStudents.map((student) => {
                      const isSelected = student.studentId === selected?.studentId;
                      return (
                        <tr
                          key={student._id}
                          className={`border-b border-border transition-colors ${
                            isSelected ? "bg-primary-light" : "hover:bg-background"
                          }`}
                        >
                          <td className="py-4 px-6 text-primary font-bold text-[12px]" dir="ltr">
                            {student.studentId || "—"}
                          </td>
                          <td className="py-4 px-6 font-semibold text-text-main">{student.name}</td>
                          <td className="py-4 px-6 text-text-muted" dir="ltr">
                            {student.email}
                          </td>
                          <td className="py-4 px-6 text-text-muted">{studentStageTitle(student)}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <ActionButton type="view" label="عرض" onClick={() => dash.setSelected(student)} />
                              <ActionButton type="edit" label="تعديل" onClick={() => setEditing(student)} />
                              <ActionButton
                                type="delete"
                                label="حذف"
                                disabled={dash.busy}
                                onClick={() => setConfirmDelete(student)}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subscription access control: toggle subscribed months for the selected
              student's stage. */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[20px] font-extrabold text-text-main">التحكم في وصول الاشتراكات</h2>

            <div className="bg-surface border border-border rounded-[16px] p-6 flex flex-col gap-5 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-4 gap-2">
                <h3 className="text-[16px] font-extrabold text-text-main">
                  {selected
                    ? `الطالب: ${selected.name} • ${studentStageTitle(selected)}`
                    : "اختر طالباً"}
                </h3>
                <span className="text-[14px] text-text-muted">تحديد الأشهر النشطة لملف الطالب الحالي</span>
              </div>

              {!selected ? (
                <p className="text-[14px] text-text-muted text-center py-8">
                  لا يوجد طالب محدد — اختر طالباً من الجدول.
                </p>
              ) : dash.loadingMonths ? (
                <p className="text-[14px] text-text-muted text-center py-8">جاري تحميل أشهر المرحلة...</p>
              ) : dash.stageMonths.length === 0 ? (
                <p className="text-[14px] text-text-muted text-center py-8">
                  لا توجد أشهر متاحة لهذه المرحلة. تأكد من ربط الطالب بمرحلة دراسية.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {dash.stageMonths.map((month) => {
                    const isSubscribed = subscribedIds.includes(String(month._id));
                    return (
                      <div
                        key={month._id}
                        className={`bg-background rounded-xl p-4 flex flex-col justify-between items-center gap-4 text-center border ${
                          isSubscribed ? "border-primary" : "border-border"
                        }`}
                      >
                        <h4 className="text-[14px] font-bold text-text-main">{month.title}</h4>
                        <div className="flex items-center gap-3">
                          <span className={`text-[12px] font-bold ${isSubscribed ? "text-success" : "text-text-muted"}`}>
                            {isSubscribed ? "مفتوح" : "مغلق"}
                          </span>
                          <button
                            type="button"
                            disabled={dash.busy || !selected.studentId}
                            onClick={() =>
                              selected.studentId &&
                              dash.applySubscription(selected.studentId, String(month._id), isSubscribed)
                            }
                            className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors disabled:opacity-50 ${
                              isSubscribed ? "bg-primary justify-end" : "bg-[#D9D9D9] justify-start"
                            }`}
                            aria-label={isSubscribed ? "إلغاء الاشتراك" : "تفعيل الاشتراك"}
                          >
                            <span className="w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center">
                              {isSubscribed && <Check size={12} className="text-primary" strokeWidth={3} />}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <EditStudentModal
        open={!!editing}
        student={editing}
        stages={dash.allStages}
        saving={dash.busy}
        error={dash.error}
        onClose={() => setEditing(null)}
        onSave={handleEditSave}
      />

      {/* Delete confirmation dialog for the pending student. */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 p-4" dir="rtl">
          <div className="w-full max-w-[420px] bg-surface rounded-[20px] border border-border p-6 shadow-2xl flex flex-col gap-5">
            <h3 className="text-[18px] font-extrabold text-text-main text-center">تأكيد حذف الحساب</h3>
            <p className="text-[14px] text-text-muted text-center">
              سيتم حذف حساب «{confirmDelete.name}» نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={dash.busy}
                className="flex-1 h-[48px] bg-transparent border border-border text-text-muted font-bold text-[14px] rounded-xl hover:bg-surface-secondary transition-colors disabled:opacity-60"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={dash.busy}
                className="flex-1 h-[48px] bg-danger text-white font-bold text-[14px] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <X size={16} />
                {dash.busy ? "جاري الحذف..." : "حذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
