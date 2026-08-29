"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser, fetchEducationalStages, savePendingUserId, type EducationStage } from "@/lib/api";
import {
  evaluatePassword,
  getPasswordStrength,
  PASSWORD_STRENGTH_LABELS,
  type PasswordStrengthLevel,
} from "@/lib/password";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  address: string;
  educationalStageId: string;
}

const INITIAL_FORM: RegisterForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  address: "",
  educationalStageId: "",
};

const INPUT_CLASS =
  "w-full h-[52px] rounded-xl border-[1.5px] border-border bg-surface px-4 text-text-main placeholder-text-muted focus:border-primary outline-none text-[14px] md:text-[15px] transition-all text-right";

function FormField({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block mb-6">
      <span className="block text-[13px] md:text-[14px] font-semibold text-text-main mb-2 text-right">{label}</span>
      <input className={INPUT_CLASS} dir="rtl" {...props} />
    </label>
  );
}

function PasswordField({
  label,
  showStrength,
  value,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; showStrength?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);

  const password = typeof value === "string" ? value : Array.isArray(value) ? value.join("") : String(value ?? "");

  const checks = evaluatePassword(password);
  const level = getPasswordStrength(password);

  const LEVEL_COLORS: Record<PasswordStrengthLevel, string> = {
    1: "var(--color-danger)",
    2: "var(--color-warning)",
    3: "var(--color-success)",
    4: "var(--color-success)",
  };

  const levelColor = LEVEL_COLORS[level];
  const successColor = "var(--color-success)";
  const trackColor = "var(--color-border)";
  const mutedColor = "var(--color-text-muted)";
  const complexEnough = checks.caseMix && checks.number && checks.special;

  return (
    <div className="block mb-6">
      <label>
        <span className="block text-[13px] md:text-[14px] font-semibold text-text-main mb-2 text-right">{label}</span>
        <div className="relative">
          <input type={showPassword ? "text" : "password"} className={`${INPUT_CLASS} pl-14`} dir="rtl" {...props} />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 left-4 my-auto h-fit text-[12px] md:text-[13px] font-semibold text-primary-hover hover:text-primary transition-colors"
          >
            {showPassword ? "إخفاء" : "عرض"}
          </button>
        </div>
      </label>

      {showStrength && (
        <div className="flex flex-col gap-[6px] mt-3">
          <div className="flex justify-between items-center w-full" dir="rtl">
            <span className="text-text-muted font-medium text-[11px] md:text-[12px]">مستوى أمان كلمة المرور</span>
            <span className="font-bold text-[11px] md:text-[12px] transition-colors" style={{ color: levelColor }}>
              {PASSWORD_STRENGTH_LABELS[level]}
            </span>
          </div>
          <div className="flex flex-row-reverse gap-1 w-full h-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-full flex-1 rounded-full transition-colors"
                style={{ backgroundColor: i <= level ? levelColor : trackColor }}
              />
            ))}
          </div>
          <div className="flex flex-col gap-1 mt-1 text-right" dir="rtl">
            <span
              className="text-[10px] md:text-[11px] font-medium transition-colors leading-relaxed"
              style={{ color: checks.minLength ? successColor : mutedColor }}
            >
              • يجب أن تحتوي على ٨ أحرف على الأقل
            </span>
            <span
              className="text-[10px] md:text-[11px] font-medium transition-colors leading-relaxed"
              style={{ color: complexEnough ? successColor : mutedColor }}
            >
              • يجب أن تتضمن حرفاً كبيراً وصغيراً ورقمية ورمزاً خاصاً مثل (#, @, $)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stages, setStages] = useState<EducationStage[]>([]);
  const [stagesLoading, setStagesLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchEducationalStages()
      .then((list) => {
        if (isMounted) setStages(list);
      })
      .finally(() => {
        if (isMounted) setStagesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);

    try {
      const { userId } = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
        address: form.address,
        ...(form.educationalStageId && {
          educationalStageId: form.educationalStageId,
        }),
      });
      savePendingUserId(userId);
      router.push(`/account/verify-email?userId=${userId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 sm:py-12 md:py-20 relative overflow-hidden py-20">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('/path-to-islamic-pattern.svg')] bg-repeat "></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-[600px] bg-surface rounded-[20px] md:rounded-[24px] border border-border p-6 sm:p-8 md:p-12 shadow-[0_16px_48px_-4px_rgba(84,70,58,0.0588)]"
        dir="rtl"
      >
        <div className="flex flex-col items-center justify-center mb-6 md:mb-8">
          <svg
            className="w-full max-w-[504px] h-[14px] md:h-[18px] mb-3"
            viewBox="0 0 504 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="171" y="8.5" width="60" height="1" fill="#D4AF37" />
            <path
              d="M251.792 1.55918C251.729 1.59826 251.678 1.65416 251.645 1.72056L249.913 5.22981C249.799 5.46101 249.63 5.661 249.422 5.81255C249.213 5.9641 248.971 6.06268 248.716 6.09981L244.842 6.66606C244.768 6.67648 244.699 6.7074 244.642 6.7553C244.585 6.80319 244.542 6.86613 244.519 6.93695C244.496 7.00777 244.494 7.08362 244.512 7.15587C244.53 7.22811 244.568 7.29383 244.621 7.34556L247.423 10.0733C247.608 10.2534 247.747 10.4758 247.827 10.7213C247.906 10.9669 247.925 11.2281 247.882 11.4826L247.221 15.3368C247.208 15.4101 247.216 15.4855 247.244 15.5545C247.272 15.6235 247.318 15.6832 247.379 15.727C247.439 15.7707 247.51 15.7967 247.584 15.802C247.658 15.8073 247.733 15.7916 247.798 15.7568L251.261 13.9358C251.489 13.816 251.743 13.7534 252.001 13.7534C252.259 13.7534 252.513 13.816 252.741 13.9358L256.204 15.7568C256.27 15.7918 256.344 15.8077 256.419 15.8025C256.493 15.7973 256.564 15.7713 256.625 15.7276C256.685 15.6838 256.732 15.6239 256.76 15.5548C256.788 15.4857 256.796 15.4102 256.783 15.3368L256.121 11.4818C256.078 11.2275 256.097 10.9664 256.176 10.721C256.256 10.4757 256.395 10.2534 256.579 10.0733L259.381 7.34481C259.434 7.29302 259.472 7.22741 259.49 7.15539C259.508 7.08336 259.505 7.00781 259.482 6.93726C259.459 6.86672 259.417 6.804 259.36 6.75621C259.303 6.70841 259.234 6.67745 259.161 6.66681L255.286 6.09981C255.031 6.06239 254.789 5.96368 254.581 5.81215C254.373 5.66062 254.204 5.46079 254.09 5.22981L252.358 1.72056C252.325 1.65416 252.274 1.59826 252.211 1.55918C252.148 1.5201 252.075 1.49939 252.001 1.49939C251.927 1.49939 251.855 1.5201 251.792 1.55918Z"
              stroke="#D4AF37"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect x="273" y="8.5" width="60" height="1" fill="#D4AF37" />
          </svg>

          <h1 className="text-[24px] md:text-[28px] font-extrabold text-text-main text-center mb-1">إنشاء حساب جديد</h1>
          <p className="text-center text-[13px] md:text-[14px] font-medium text-text-muted">
            انضم إلى نخبة الطلاب في منصة التعليم العربية الأرقى
          </p>
        </div>

        <FormField
          label="الاسم الكامل"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="أدخل اسمك الثلاثي"
        />

        <FormField
          label="البريد الإلكتروني"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="example@gamil.com"
        />

        <PasswordField
          label="كلمة المرور"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          showStrength={true}
        />

        <PasswordField
          label="تأكيد كلمة المرور"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          placeholder="أعد كتابة كلمة المرور للتأكيد"
        />

        <FormField
          label="رقم الهاتف"
          name="phoneNumber"
          type="tel"
          value={form.phoneNumber}
          onChange={handleChange}
          required
          placeholder="010xxxxxxxx"
        />

        <FormField
          label="العنوان"
          name="address"
          type="text"
          value={form.address}
          onChange={handleChange}
          required
          placeholder="مثال: مركز بدر عمر شاهين"
        />

        <div className="block mb-8">
          <label className="block text-[13px] md:text-[14px] font-semibold text-text-main mb-2 text-right">
            المرحلة التعليمية
          </label>
          <div className="relative">
            <select
              name="educationalStageId"
              value={form.educationalStageId}
              onChange={handleChange}
              disabled={stagesLoading || stages.length === 0}
              className={`${INPUT_CLASS} appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <option value="">
                {stagesLoading
                  ? "جاري تحميل المراحل..."
                  : stages.length > 0
                    ? "اختر المرحلة الدراسية الخاصة بك"
                    : "لا توجد مراحل متاحة حالياً"}
              </option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.title}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-muted">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-danger bg-danger-bg border border-danger/30 rounded-lg p-3 mb-6 text-center font-medium">
            {error}
          </p>
        )}

        <div className="flex flex-col items-center gap-4 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] md:h-[58px] bg-primary rounded-xl text-text-main font-bold text-[15px] md:text-[16px] shadow-[0_12px_32px_-4px_rgba(196,154,69,0.1)] hover:bg-primary-hover disabled:opacity-60 transition-colors flex items-center justify-center"
          >
            {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
          </button>

          <div className="flex items-center gap-1">
            <span className="text-text-muted font-medium text-[13px] md:text-[14px]">لديك حساب بالفعل؟</span>
            <Link
              href="/account/login"
              className="text-primary-hover font-bold text-[13px] md:text-[14px] hover:text-primary transition-colors"
            >
              سجل دخولك الآن
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
