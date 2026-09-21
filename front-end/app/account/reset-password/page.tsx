"use client";

// Reset-password route - thin wrapper that renders the shared
// ResetPasswordContent component (email + OTP + new password form).
import ResetPasswordContent from "./module/reset-password-content";

export default function ResetPasswordForm() {
  return <ResetPasswordContent />;
}
