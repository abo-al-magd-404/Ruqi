"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, ChevronDown, Info, CheckCircle2 } from "lucide-react";
import { getProfile } from "@/lib/account/profile";
import { getEducationalStages } from "@/lib/educational-content/stages";
import { getMonthsByStage } from "@/lib/educational-content/months";
import type { Month } from "@/lib/types/educational-content";

const INPUT_CLASS =
  "h-12 w-full bg-background border border-border rounded-xl px-4 text-[14px] text-text-main outline-none focus:border-primary transition-colors";

const PAYMENT_METHODS = ["بطاقة مدى / فيزا", "تحويل بنكي", "Apple Pay"];

const WHATSAPP_NUMBER = "201000000000";

export default function SubscriptionRequestPage() {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [stageTitle, setStageTitle] = useState("");
  const [months, setMonths] = useState<Month[]>([]);
  const [monthId, setMonthId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const profile = await getProfile();
        if (!active) return;
        setName(profile.name);
        setStudentId(profile.studentId ?? "");
        if (profile.stage) {
          const stages = await getEducationalStages().catch(() => []);
          const stage = stages.find((s) => s._id === profile.stage);
          if (active && stage) setStageTitle(stage.title);
          const monthList = await getMonthsByStage(profile.stage).catch(() => []);
          if (active) {
            const sorted = [...monthList].sort((a, b) => a.order - b.order);
            setMonths(sorted);
            if (sorted[0]) setMonthId(String(sorted[0]._id));
          }
        }
      } catch {
        // زائر غير مسجّل — يبقى النموذج فارغاً
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const selectedMonth = useMemo(
    () => months.find((m) => String(m._id) === monthId),
    [months, monthId],
  );

  const whatsappHref = useMemo(() => {
    const text = `طلب اشتراك جديد\nالاسم: ${name}\nالرقم التعريفي: ${studentId}\nالشهر: ${
      selectedMonth?.title ?? "—"
    }\nطريقة الدفع: ${paymentMethod}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }, [name, studentId, selectedMonth, paymentMethod]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="w-full min-h-screen bg-background flex flex-col items-center px-6 pt-28 pb-16 md:pt-[140px] md:pb-24 font-cairo">
      <div className="w-full max-w-[640px] bg-surface border border-border shadow-sm rounded-[24px] p-6 md:p-[48px] flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 w-full text-center">
          <div className="w-16 h-16 bg-primary-light rounded-full flex justify-center items-center mb-1">
            <BadgeCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-[26px] font-extrabold text-text-main">طلب اشتراك جديد</h1>
          <p className="text-[14px] font-normal text-text-muted">
            أدخل التفاصيل المطلوبة لتسجيل اشتراكك في باقات رُقِيّ التعليمية المتميزة
          </p>
        </div>

        <hr className="w-full border-border" />

        {submitted ? (
          <div className="w-full flex flex-col items-center gap-5 text-center py-6">
            <CheckCircle2 className="w-16 h-16 text-success" />
            <h2 className="text-[20px] font-extrabold text-text-main">تم إرسال طلبك بنجاح</h2>
            <p className="text-[14px] text-text-muted leading-relaxed max-w-[420px]">
              سيتواصل معك أحد مستشارينا الأكاديميين عبر واتساب لتأكيد الدفع وتفعيل المناهج. يمكنك
              تسريع العملية بالتواصل مباشرة.
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="h-[54px] px-8 bg-primary hover:bg-primary-hover text-[#1E1A17] text-[15px] font-bold rounded-xl transition-colors flex items-center justify-center"
            >
              التواصل عبر واتساب
            </a>
            <Link href="/account/profile" className="text-[14px] font-bold text-primary hover:underline">
              العودة إلى حسابي
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-[14px] font-bold text-text-main">الاسم الكامل للطالب</label>
              <input type="text" value={name} readOnly placeholder="—" className={`${INPUT_CLASS} cursor-not-allowed`} />
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label className="text-[14px] font-bold text-text-main">الرقم التعريفي للطالب</label>
              <input
                type="text"
                value={studentId}
                readOnly
                placeholder="—"
                className={`${INPUT_CLASS} cursor-not-allowed`}
                dir="ltr"
              />
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label className="text-[14px] font-bold text-text-main">المرحلة التعليمية</label>
              <input
                type="text"
                value={stageTitle}
                readOnly
                placeholder="—"
                className={`${INPUT_CLASS} cursor-not-allowed`}
              />
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label className="text-[14px] font-bold text-text-main">الشهر المطلوب الاشتراك به</label>
              <div className="relative">
                <select
                  value={monthId}
                  onChange={(e) => setMonthId(e.target.value)}
                  disabled={loading || months.length === 0}
                  className={`${INPUT_CLASS} appearance-none cursor-pointer disabled:cursor-not-allowed`}
                >
                  {months.length === 0 ? (
                    <option value="">لا توجد أشهر متاحة</option>
                  ) : (
                    months.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.title}
                        {typeof m.price === "number" && m.price > 0 ? ` — ${m.price} ج.م` : ""}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label className="text-[14px] font-bold text-text-main">طريقة الدفع المفضلة</label>
              <div className="relative">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={`${INPUT_CLASS} appearance-none cursor-pointer`}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label className="text-[14px] font-bold text-text-main">معلومات أو ملاحظات إضافية للدفع</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثل: كود الخصم، أو ملاحظات خاصة بعملية التحويل"
                className={INPUT_CLASS}
              />
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label className="text-[14px] font-bold text-text-main">رسالتك لإدارة المنصة</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب استفساراتك أو طلباتك الخاصة بخصوص الاشتراك هنا..."
                className="min-h-[120px] w-full bg-background border border-border rounded-xl p-4 text-[14px] text-text-main placeholder:text-text-muted outline-none focus:border-primary transition-colors resize-y"
              ></textarea>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <button
                type="submit"
                className="h-[58px] w-full bg-primary hover:bg-primary-hover text-[#1E1A17] text-[16px] font-bold rounded-xl shadow-sm transition-colors flex justify-center items-center"
              >
                إرسال طلب الاشتراك
              </button>

              <div className="w-full bg-background border border-border rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-[12px] leading-[1.6] text-text-muted">
                  تنبيه: بعد إرسال طلب الاشتراك، سيتواصل معك أحد مستشارينا الأكاديميين عبر واتساب لتأكيد
                  الدفع وتفعيل المناهج فوراً. يرجى إبقاء رقم الهاتف متاحاً.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
