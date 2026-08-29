"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, NotVerifiedError, getPendingUserId } from "@/lib/api";

interface LoginForm {
  email: string;
  password: string;
}

const INITIAL_FORM: LoginForm = {
  email: "",
  password: "",
};

const INPUT_CLASS =
  "w-full h-[52px] rounded-xl border-[1.5px] bg-surface px-4 text-text-main placeholder-text-muted outline-none text-[14px] md:text-[15px] transition-all text-right";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsActivation, setNeedsActivation] = useState(false);

  const [emailError, setEmailError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "email" && emailError) setEmailError(false);
    if (error) setError(null);
    if (needsActivation) setNeedsActivation(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email.includes("@")) {
      setEmailError(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loginUser(form);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof NotVerifiedError) {
        setNeedsActivation(true);
      } else {
        setError(err instanceof Error ? err.message : "بيانات الدخول غير صحيحة، يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden font-cairo">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('/path-to-islamic-pattern.svg')] bg-repeat"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-[520px] bg-surface rounded-[24px] border border-border p-8 md:p-12 shadow-[0_16px_48px_-4px_rgba(84,70,58,0.0588)]"
        dir="rtl"
      >
        <div className="flex flex-col items-center justify-center mb-8">
          <svg
            className="w-full max-w-[424px] h-[14px] md:h-[18px] mb-3"
            viewBox="0 0 424 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="131" y="8.5" width="60" height="1" fill="#D4AF37" />
            <path
              d="M211.792 1.55918C211.729 1.59826 211.678 1.65416 211.645 1.72056L209.913 5.22981C209.799 5.46101 209.63 5.661 209.422 5.81255C209.213 5.9641 208.971 6.06268 208.716 6.09981L204.842 6.66606C204.768 6.67648 204.699 6.7074 204.642 6.7553C204.585 6.80319 204.542 6.86613 204.519 6.93695C204.496 7.00777 204.494 7.08362 204.512 7.15587C204.53 7.22811 204.568 7.29383 204.621 7.34556L207.423 10.0733C207.608 10.2534 207.747 10.4758 207.827 10.7213C207.906 10.9669 207.925 11.2281 207.882 11.4826L207.221 15.3368C207.208 15.4101 207.216 15.4855 207.244 15.5545C207.272 15.6235 207.318 15.6832 207.379 15.727C207.439 15.7707 207.51 15.7967 207.584 15.802C207.658 15.8073 207.733 15.7916 207.798 15.7568L211.261 13.9358C211.489 13.816 211.743 13.7534 212.001 13.7534C212.259 13.7534 212.513 13.816 212.741 13.9358L216.204 15.7568C216.27 15.7918 216.344 15.8077 216.419 15.8025C216.493 15.7973 216.564 15.7713 216.625 15.7276C216.685 15.6838 216.732 15.6239 216.76 15.5548C216.788 15.4857 216.796 15.4102 216.783 15.3368L216.121 11.4818C216.078 11.2275 216.097 10.9664 216.176 10.721C216.256 10.4757 216.395 10.2534 216.579 10.0733L219.381 7.34481C219.434 7.29302 219.472 7.22741 219.49 7.15539C219.508 7.08336 219.505 7.00781 219.482 6.93726C219.459 6.86672 219.417 6.804 219.36 6.75621C219.303 6.70841 219.234 6.67745 219.161 6.66681L215.286 6.09981C215.031 6.06239 214.789 5.96368 214.581 5.81215C214.373 5.66062 214.204 5.46079 214.09 5.22981L212.358 1.72056C212.325 1.65416 212.274 1.59826 212.211 1.55918C212.148 1.5201 212.075 1.49939 212.001 1.49939C211.927 1.49939 211.855 1.5201 211.792 1.55918Z"
              stroke="#D4AF37"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect x="233" y="8.5" width="60" height="1" fill="#D4AF37" />
          </svg>

          <h1 className="text-[24px] md:text-[28px] font-extrabold text-text-main text-center mb-1">تسجيل الدخول</h1>
          <p className="text-center text-[13px] md:text-[14px] font-medium text-text-muted">
            مرحباً بك مجدداً في محراب العلم والمعرفة
          </p>
        </div>

        <div className="block mb-5">
          <label className="block text-[13px] md:text-[14px] font-semibold text-text-main mb-2 text-right">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            dir="rtl"
            placeholder="example@ruqi.edu.sa"
            className={`${INPUT_CLASS} ${
              emailError ? "border-danger text-text-main" : "border-border focus:border-primary"
            }`}
          />
          {emailError && (
            <p className="text-danger text-[12px] font-semibold mt-2 text-right">
              البريد الإلكتروني المدخل غير صحيح، يرجى التحقق من الصيغة.
            </p>
          )}
        </div>

        <div className="block mb-6">
          <label className="block text-[13px] md:text-[14px] font-semibold text-text-main mb-2 text-right">
            كلمة المرور
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              dir="rtl"
              placeholder="ادخل كلمة السر"
              className={`${INPUT_CLASS} pl-14 border-border focus:border-primary`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 left-4 my-auto h-fit text-[12px] md:text-[13px] font-semibold text-primary-hover hover:text-primary transition-colors"
            >
              {showPassword ? "إخفاء" : "عرض"}
            </button>
          </div>
          <div className="mt-2 text-left">
            <Link
              href="/forgot-password"
              className="text-primary-hover font-semibold text-[13px] md:text-[14px] hover:text-primary transition-colors"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>
        </div>

        {error && !emailError && (
          <p className="text-sm text-danger bg-danger-bg border border-danger/30 rounded-lg p-3 mb-6 text-center font-medium">
            {error}
          </p>
        )}

        {needsActivation &&
          (() => {
            const pendingUserId = getPendingUserId();
            return (
              <p className="text-sm text-warning bg-warning-bg border border-warning/30 rounded-lg p-3 mb-6 text-center font-medium">
                لم يتم تفعيل حسابك بعد.
                <Link
                  href={pendingUserId ? `/account/verify-email?userId=${pendingUserId}` : "/account/register"}
                  className="text-warning font-bold underline ms-1 hover:text-primary transition-colors"
                >
                  تفعيل الحساب
                </Link>
              </p>
            );
          })()}

        <div className="flex flex-col items-center gap-5 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] md:h-[58px] bg-primary rounded-xl text-text-main font-bold text-[15px] md:text-[16px] shadow-[0_12px_32px_-4px_rgba(196,154,69,0.1)] hover:bg-primary-hover disabled:opacity-60 transition-colors flex items-center justify-center"
          >
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>

          <div className="flex items-center gap-1">
            <span className="text-text-muted font-medium text-[13px] md:text-[14px]">ليس لديك حساب؟</span>
            <Link
              href="/account/register"
              className="text-primary-hover font-bold text-[13px] md:text-[14px] hover:text-primary transition-colors"
            >
              أنشئ حساباً الآن
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
