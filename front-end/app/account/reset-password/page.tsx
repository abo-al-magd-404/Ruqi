"use client";

import { Suspense } from "react";
import ResetPasswordContent from "@/components/account/AuthForm/ResetPasswordContent";

export default function ResetPasswordForm() {

  return (
    <Suspense fallback={<div className="text-text-muted">جاري التحميل...</div>}>
    <ResetPasswordContent/>
    </Suspense>
  );
}