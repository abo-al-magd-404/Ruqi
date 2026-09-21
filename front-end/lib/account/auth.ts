// ============= Account: Auth =============
// Client-side auth API used by the login / register / forgot-password /
// reset-password pages. Covers signup, OTP verification, login, logout and
// password reset, and exports NotVerifiedError for not-yet-activated accounts.

import {
  API_BASE_URL,
  formatApiError,
  safeJson,
} from "../core/http";
import { clearTokens, getAccessToken } from "../tokens/tokens";

import type {
  SignupPayload,
  SignupResult,
  VerifyAccountPayload,
  LoginPayload,
  LoginResult,
} from "../types/account";

export class NotVerifiedError extends Error {
  constructor() {
    super("الحساب غير مفعل، يرجى تفعيل الحساب أولاً بواسطة رمز التحقق");
    this.name = "NotVerifiedError";
  }
}

// ============= Signup & Verification =============

export async function signup(payload: SignupPayload): Promise<SignupResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
  return data as SignupResult;
}

export async function verifyAccount(payload: VerifyAccountPayload): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/verify-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
}

export async function resendOtp(email: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
}

// ============= Login & Logout =============

export async function loginUser(payload: LoginPayload): Promise<LoginResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);

  if (!res.ok) {
    // A 403 (or a message mentioning activation) means the account exists
    // but has not been activated with the verification code yet.
    if (res.status === 403 || data.message?.includes("تفعيل")) {
      throw new NotVerifiedError();
    }
    throw new Error(formatApiError(data));
  }

  return data as LoginResult;
}

export async function logoutUser(): Promise<void> {
  const token = getAccessToken();
  // Best-effort server-side logout: notify the backend if we have a token,
  // but always clear the local tokens even if the request fails.
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  }
  clearTokens();
}

// ============= Password Reset =============

export async function forgetPassword(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/forget-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await safeJson(response);
  if (!response.ok) {
    throw new Error(formatApiError(data));
  }
  return data;
}

export async function resetPassword(body: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await safeJson(response);
  if (!response.ok) {
    throw new Error(formatApiError(data));
  }
  return data;
}