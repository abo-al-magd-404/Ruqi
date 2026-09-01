export const API_BASE_URL = "/api/backend";

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
}

export interface SignupResult {
  message: string;
  email: string;
}

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

  const data = await res.json();

  if (!res.ok) {
    throw new Error(formatApiError(data));
  }

  return data as SignupResult;
}

export interface VerifyAccountPayload {
  email: string;
  otp: string;
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

  const data = await res.json();

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

  const data = await res.json();

  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
}

export class NotVerifiedError extends Error {
  constructor() {
    super("الحساب غير مفعل، يرجى تفعيل الحساب أولاً بواسطة رمز التحقق");
    this.name = "NotVerifiedError";
  }
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    studentId: string | null;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

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

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 403) {
      throw new NotVerifiedError();
    }
    throw new Error(formatApiError(data));
  }

  return data as LoginResult;
}

function formatApiError(data: unknown): string {
  if (!data || typeof data !== "object") return "حدث خطأ ما";

  const raw = (data as { message?: unknown }).message;

  if (Array.isArray(raw)) {
    return raw.filter((i): i is string => typeof i === "string").join("، ");
  }

  if (typeof raw === "string") return raw;

  return "حدث خطأ ما";
}

const ACCESS_TOKEN_KEY = "ruqi_access_token";
const REFRESH_TOKEN_KEY = "ruqi_refresh_token";
const PENDING_EMAIL_KEY = "ruqi_pending_email";

export function saveTokens(tokens: { accessToken: string; refreshToken: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/get-new-access-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return false;
  }

  if (!res.ok) return false;

  const data = await res.json();
  const tokens = (data as { tokens?: { accessToken?: string; refreshToken?: string } })
    .tokens;

  if (!tokens?.accessToken || !tokens?.refreshToken) return false;

  saveTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  return true;
}

async function authedFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const withAuth = (token: string | null) => ({
    ...init,
    headers: {
      ...init.headers,
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  let res: Response;
  try {
    res = await fetch(url, withAuth(getAccessToken()));
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      try {
        res = await fetch(url, withAuth(getAccessToken()));
      } catch {
        throw new Error("تعذر الاتصال بالخادم");
      }
    }
  }

  return res;
}

export interface UserProfile {
  _id: string;
  studentId: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: string;
  status: string;
  educationalStage: string;
  createdAt: string;
  updatedAt: string;
}

export async function getProfile(): Promise<UserProfile> {
  const res = await authedFetch(`${API_BASE_URL}/users/me`);

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) clearTokens();
    throw new Error(formatApiError(data));
  }

  return normalizeProfile(data);
}

function normalizeProfile(data: unknown): UserProfile {
  const src =
    data && typeof data === "object" && "user" in (data as Record<string, unknown>)
      ? ((data as Record<string, unknown>).user as Record<string, unknown>)
      : (data as Record<string, unknown>);

  const raw = Array.isArray(src) ? (src[0] as Record<string, unknown>) : src;

  return {
    _id: String(raw?._id ?? raw?.id ?? ""),
    studentId: String(raw?.studentId ?? ""),
    name: String(raw?.name ?? ""),
    email: String(raw?.email ?? ""),
    phoneNumber: String(raw?.phoneNumber ?? ""),
    address: String(raw?.address ?? ""),
    role: String(raw?.role ?? ""),
    status: String(raw?.status ?? ""),
    educationalStage: String(raw?.educationalStage ?? raw?.stage ?? ""),
    createdAt: String(raw?.createdAt ?? ""),
    updatedAt: String(raw?.updatedAt ?? ""),
  };
}

export interface UpdateStudentProfilePayload {
  name?: string;
  password?: string;
  phoneNumber?: string;
  address?: string;
  educationalStage?: string;
}

export async function updateStudentProfile(
  payload: UpdateStudentProfilePayload
): Promise<UserProfile> {
  const res = await authedFetch(`${API_BASE_URL}/users/student/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) clearTokens();
    throw new Error(formatApiError(data));
  }

  return normalizeProfile(data.user);
}



export function savePendingEmail(email: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(PENDING_EMAIL_KEY, email);
  }
}

export function getPendingEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PENDING_EMAIL_KEY);
}

export async function logoutUser(): Promise<void> {
  const token = getAccessToken();

  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // تجاهل أخطاء الخادم عند الخروج، نكمل تنظيف الجلسة محلياً دائماً
    }
  }

  clearTokens();
}
