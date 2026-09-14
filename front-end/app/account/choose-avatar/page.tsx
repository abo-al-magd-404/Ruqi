"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AvatarPicker from "../module/AvatarPicker";
import GuestGuard from "../module/GuestGuard";
import {
  getPendingEmail,
  getPendingName,
  clearPendingEmail,
  clearPendingName,
} from "@/lib/core/http";
import { pendingAvatarStorage, AVATAR_FALLBACK_NAME } from "@/lib/avatar";

function ChooseAvatar() {
  const router = useRouter();
  const [name] = useState<string | null>(() => getPendingName());
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getPendingEmail()) {
      router.replace("/account/login");
    }
  }, [router]);

  const handleContinue = () => {
    setSaving(true);
    pendingAvatarStorage().set(avatar.trim() || name || AVATAR_FALLBACK_NAME);
    clearPendingEmail();
    clearPendingName();
    router.push("/account/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden font-cairo">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('/path-to-islamic-pattern.svg')] bg-repeat"></div>

      <div
        className="relative z-10 w-full max-w-[520px] bg-surface rounded-[24px] border border-border p-8 sm:p-10 md:p-12 shadow-[0_16px_48px_-4px_rgba(84,70,58,0.0588)] flex flex-col items-center"
        dir="rtl"
      >
        <div className="flex flex-col items-center justify-center mb-6 text-center">
          <svg
            className="w-full max-w-[420px] h-[14px] md:h-[18px] mb-6"
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

          <h1 className="text-[24px] md:text-[28px] font-extrabold text-text-main mb-3">
            اختر صورتك الرمزية
          </h1>
          <p className="text-center text-[13px] md:text-[14px] font-medium text-text-muted leading-relaxed max-w-[380px]">
            خصّص صورتك الرمزية لتُمثّلك في حسابك ولوحة المتفوقين من خلال اختيار اللون
            والشكل والملامح، ويمكنك تغييرها لاحقاً من حسابك.
            {name ? ` أهلاً بك، ${name}!` : ""}
          </p>
        </div>

        <div className="w-full">
          <AvatarPicker
            value={avatar}
            fallbackName={name || AVATAR_FALLBACK_NAME}
            previewSize={160}
            onChange={setAvatar}
          />
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={saving}
          className="mt-6 w-full h-[54px] bg-primary rounded-xl text-text-main font-bold text-[15px] md:text-[16px] shadow-[0_12px_32px_-4px_rgba(196,154,69,0.1)] hover:bg-primary-hover disabled:opacity-60 transition-colors flex items-center justify-center"
        >
          {saving ? "جاري الحفظ..." : "حفظ والمتابعة"}
        </button>

        <Link
          href="/account/login"
          className="mt-4 text-[13px] md:text-[14px] text-text-muted font-semibold hover:text-primary transition-colors"
        >
          تخطّي الآن — سأختارها لاحقاً
        </Link>
      </div>
    </div>
  );
}

export default function ChooseAvatarPage() {
  return (
    <GuestGuard>
      <ChooseAvatar />
    </GuestGuard>
  );
}