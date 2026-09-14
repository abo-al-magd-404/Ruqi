"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, signup, NotVerifiedError } from "@/lib/account/auth";
import { saveTokens } from "@/lib/tokens/tokens";
import { savePendingEmail, getPendingEmail, savePendingName, clearPendingEmail, clearPendingName } from "@/lib/core/http";
import { pendingAvatarStorage } from "@/lib/avatar";
import { updateStudentProfile } from "@/lib/account/profile";
import { getEducationalStages } from "@/lib/educational-content/stages";
import { evaluatePassword } from "@/lib/password";
import type { EducationalStage } from "@/lib/types/educational-content";
import PasswordField from "./password-field";

type Mode = "login" | "register";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  address: string;
  stage: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  address: "",
  stage: "",
};

const INPUT_CLASS =
  "w-full h-[52px] rounded-xl border-[1.5px] bg-surface px-4 text-text-main placeholder-text-muted outline-none text-[14px] md:text-[15px] transition-all text-right";

type FieldTone = "default" | "success" | "error";

function FormField({
  label,
  tone = "default",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; tone?: FieldTone }) {
  const borderClass =
    tone === "error"
      ? "border-danger focus:border-danger"
      : tone === "success"
        ? "border-success focus:border-success"
        : "border-border focus:border-primary";
  return (
    <div className="block mb-5">
      <label className="block text-[13px] md:text-[14px] font-semibold text-text-main mb-2 text-right">{label}</label>
      <input
        className={`${INPUT_CLASS} ${borderClass}`}
        dir="rtl"
        {...props}
      />
    </div>
  );
}

const EGYPTIAN_PHONE_RE = /^01[0125][0-9]{8}$/;
const ARABIC_CHAR_RE = /[\u0621-\u064A]/;
const ARABIC_NAME_RE = /^[\u0621-\u064A\s]+$/;
const ARABIC_ADDRESS_RE = /^[\u0621-\u064A0-9\u0660-\u0669\s\-/,،()]+$/;

function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, "").replace(/^(\+|00)?20/, "0");
}

function isValidEgyptianPhone(value: string): boolean {
  return EGYPTIAN_PHONE_RE.test(normalizePhone(value));
}

function isValidArabicText(value: string, allowDigits = false): boolean {
  if (!ARABIC_CHAR_RE.test(value)) return false;
  return allowDigits ? ARABIC_ADDRESS_RE.test(value) : ARABIC_NAME_RE.test(value);
}

function isFilled(value: string): boolean {
  return value.trim().length > 0;
}

function toneOf(raw: string, valid: boolean): FieldTone {
  if (!isFilled(raw)) return "default";
  return valid ? "success" : "error";
}

function isPasswordValid(password: string): boolean {
  const checks = evaluatePassword(password);
  return checks.minLength && checks.caseMix && checks.number && checks.special;
}

export default function AuthForm({ mode: initialMode }: { mode: Mode }) {
  const router = useRouter();
  const isLogin = initialMode === "login";

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState(false);
  const [needsActivation, setNeedsActivation] = useState(false);

  const [stages, setStages] = useState<EducationalStage[]>([]);
  const [loadingStages, setLoadingStages] = useState(!isLogin);

  useEffect(() => {
    if (!isLogin) {
      getEducationalStages()
        .then((data) => setStages(data))
        .catch(() => setError("تعذر تحميل المراحل الدراسية، تأكد من اتصال الخادم"))
        .finally(() => setLoadingStages(false));
    }
  }, [isLogin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    if (!isLogin) {
      if (form.password !== form.confirmPassword) {
        setError("كلمتا المرور غير متطابقتين");
        return;
      }

      if (!form.stage) {
        setError("من فضلك اختر المرحلة الدراسية أولاً");
        return;
      }

      if (!isFilled(form.name) || !isValidArabicText(form.name)) {
        setError("الاسم يجب أن يكون باللغة العربية");
        return;
      }

      if (!isValidEgyptianPhone(form.phoneNumber)) {
        setError("رقم الهاتف يجب أن يكون رقماً مصرياً صحيحاً (010/011/012/015)");
        return;
      }

      if (!isFilled(form.address) || !isValidArabicText(form.address, true)) {
        setError("العنوان يجب أن يكون باللغة العربية");
        return;
      }

      if (!isPasswordValid(form.password)) {
        setError("كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل وتتضمن حرفاً كبيراً وصغيراً ورقمية ورمزاً خاصاً (#, @, $)");
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { tokens } = await loginUser({ email: form.email, password: form.password });
        saveTokens(tokens);
        const pending = pendingAvatarStorage().get();
        if (pending) {
          try {
            await updateStudentProfile({ avatar: pending });
            pendingAvatarStorage().clear();
          } catch {}
        }
        clearPendingEmail();
        clearPendingName();
        router.push("/account/profile");
      } else {
        await signup({
          name: form.name,
          email: form.email,
          password: form.password,
          phoneNumber: normalizePhone(form.phoneNumber),
          address: form.address,
          stage: form.stage,
        });
        savePendingEmail(form.email);
        savePendingName(form.name);
        router.push(`/account/verify-email?email=${form.email}`);
      }
    } catch (err) {
      if (err instanceof NotVerifiedError) {
        setNeedsActivation(true);
      } else {
        setError(err instanceof Error ? err.message : "حدث خطأ أثناء المعالجة");
      }
    } finally {
      setLoading(false);
    }
  };

  const activationPendingEmail = getPendingEmail();

  const fieldValidity = isLogin
    ? null
    : {
        name: isValidArabicText(form.name),
        address: isValidArabicText(form.address, true),
        phone: isValidEgyptianPhone(form.phoneNumber),
        password: isPasswordValid(form.password),
      };

  const showNameMsg = fieldValidity !== null && isFilled(form.name) && !fieldValidity.name;
  const showPhoneMsg = fieldValidity !== null && isFilled(form.phoneNumber) && !fieldValidity.phone;
  const showAddressMsg = fieldValidity !== null && isFilled(form.address) && !fieldValidity.address;
  const showPasswordMsg =
    fieldValidity !== null && isFilled(form.password) && !fieldValidity.password && form.password !== form.confirmPassword;

  const confirmFilled = isFilled(form.confirmPassword);
  const passwordFilled = isFilled(form.password);
  const passwordsMatch = passwordFilled && confirmFilled && form.password === form.confirmPassword;

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden font-cairo ${
        isLogin ? "py-8 sm:py-12 md:py-20" : "py-20"
      }`}
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('/path-to-islamic-pattern.svg')] bg-repeat"></div>

      <form
        onSubmit={handleSubmit}
        className={`relative z-10 w-full bg-surface rounded-[20px] md:rounded-[24px] border border-border shadow-[0_16px_48px_-4px_rgba(84,70,58,0.0588)] p-6 sm:p-8 md:p-12 transition-all ${
          isLogin ? "max-w-[520px]" : "max-w-[600px]"
        }`}
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

          <h1 className="text-[24px] md:text-[28px] font-extrabold text-text-main text-center mb-1">
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </h1>
          <p className="text-center text-[13px] md:text-[14px] font-medium text-text-muted">
            {isLogin
              ? "مرحباً بك مجدداً في محراب العلم والمعرفة"
              : "انضم إلى نخبة الطلاب في منصة التعليم العربية الأرقى"}
          </p>
        </div>

        {!isLogin && (
          <>
            <FormField
              label="الاسم الكامل"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="أدخل اسمك الثلاثي"
              tone={fieldValidity ? toneOf(form.name, fieldValidity.name) : "default"}
            />
            {showNameMsg && (
              <p className="flex items-center gap-1 text-danger text-[12px] font-semibold -mt-4 mb-5 text-right">
                الاسم يجب أن يكون باللغة العربية
              </p>
            )}
          </>
        )}

        <FormField
          label="البريد الإلكتروني"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder={isLogin ? "yourGmail@gmail.com" : "example@gmail.com"}
          tone={emailError ? "error" : "default"}
        />
        {emailError && (
          <p className="text-danger text-[12px] font-semibold -mt-4 mb-5 text-right">
            البريد الإلكتروني المدخل غير صحيح، يرجى التحقق من الصيغة.
          </p>
        )}

        <PasswordField
          label="كلمة المرور"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          placeholder={isLogin ? "ادخل كلمة السر" : "*******"}
          showStrength={!isLogin}
          tone={fieldValidity ? toneOf(form.password, fieldValidity.password) : "default"}
        />

        {showPasswordMsg && (
          <p className="text-danger text-[12px] font-semibold -mt-4 mb-5 text-right">
            كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل وتتضمن حرفاً كبيراً وصغيراً ورقمية ورمزاً خاصاً
          </p>
        )}

        {isLogin && (
          <div className="mb-6 text-left -mt-3">
            <Link
              href="/account/forgot-password"
              className="text-primary-hover font-semibold text-[13px] md:text-[14px] hover:text-primary transition-colors"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>
        )}

        {!isLogin && (
          <>
            <PasswordField
              label="تأكيد كلمة المرور"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              placeholder="أعد كتابة كلمة المرور للتأكيد"
              tone={!confirmFilled ? "default" : passwordsMatch ? "success" : "error"}
            />
            {confirmFilled && (
              passwordsMatch ? (
                <p className="flex items-center gap-1 text-success text-[12px] font-semibold -mt-4 mb-5 text-right">
                  كلمتا المرور متطابقتان
                </p>
              ) : (
                <p className="flex items-center gap-1 text-danger text-[12px] font-semibold -mt-4 mb-5 text-right">
                  كلمتا المرور غير متطابقتين
                </p>
              )
            )}
          </>
        )}

        {!isLogin && (
          <>
            <FormField
              label="رقم الهاتف"
              name="phoneNumber"
              type="tel"
              value={form.phoneNumber}
              onChange={handleChange}
              required
              placeholder="010xxxxxxx"
              tone={fieldValidity ? toneOf(form.phoneNumber, fieldValidity.phone) : "default"}
            />
            {showPhoneMsg && (
              <p className="text-danger text-[12px] font-semibold -mt-4 mb-5 text-right">
                رقم الهاتف يجب أن يكون رقماً مصرياً صحيحاً (010/011/012/015)
              </p>
            )}
            <FormField
              label="العنوان"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              required
              placeholder="مثال: دمنهور"
              tone={fieldValidity ? toneOf(form.address, fieldValidity.address) : "default"}
            />
            {showAddressMsg && (
              <p className="text-danger text-[12px] font-semibold -mt-4 mb-5 text-right">
                العنوان يجب أن يكون باللغة العربية
              </p>
            )}

            <div className="block mb-5">
              <label className="block text-[13px] md:text-[14px] font-semibold text-text-main mb-2 text-right">
                المرحلة الدراسية
              </label>
              <select
                name="stage"
                value={form.stage}
                onChange={handleChange}
                required
                className={`${INPUT_CLASS} border-border focus:border-primary appearance-none cursor-pointer`}
                dir="rtl"
              >
                <option value="" disabled>
                  {loadingStages ? "جاري تحميل المراحل..." : "اختر المرحلة الدراسية"}
                </option>
                {stages.map((stage) => (
                  <option key={stage._id} value={stage._id}>
                    {stage.title}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {error && !emailError && (
          <p className="text-sm text-danger bg-danger-bg border border-danger/30 rounded-lg p-3 mb-6 text-center font-medium">
            {error}
          </p>
        )}

        {needsActivation && (
          <p className="text-sm text-danger bg-danger-bg border border-danger/30 rounded-lg p-3 mb-6 text-center font-medium">
            لم يتم تفعيل حسابك بعد.
            <Link
              href={
                activationPendingEmail ? `/account/verify-email?email=${activationPendingEmail}` : "/account/register"
              }
              className="text-danger font-bold underline ms-1 hover:text-primary transition-colors"
            >
              تفعيل الحساب
            </Link>
          </p>
        )}

        <div className="flex flex-col items-center gap-5 mt-2">
          <button
            type="submit"
            disabled={loading || (!isLogin && loadingStages)}
            className="w-full h-[52px] md:h-[58px] bg-primary rounded-xl text-text-main font-bold text-[15px] md:text-[16px] shadow-[0_12px_32px_-4px_rgba(196,154,69,0.1)] hover:bg-primary-hover disabled:opacity-60 transition-colors flex items-center justify-center"
          >
            {loading
              ? isLogin
                ? "جاري الدخول..."
                : "جاري الإنشاء..."
              : isLogin
                ? "تسجيل الدخول"
                : "إنشاء الحساب"}
          </button>

          <div className="flex items-center gap-1">
            <span className="text-text-muted font-medium text-[13px] md:text-[14px]">
              {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
            </span>
            <Link
              href={isLogin ? "/account/register" : "/account/login"}
              className="text-primary-hover font-bold text-[13px] md:text-[14px] hover:text-primary transition-colors"
            >
              {isLogin ? "أنشئ حساباً الآن" : "سجل دخولك الآن"}
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}