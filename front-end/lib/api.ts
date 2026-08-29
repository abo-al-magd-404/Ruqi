export const API_BASE_URL = "/api/backend";

export const EDUCATIONAL_STAGES_ENDPOINT = `${API_BASE_URL}/stages`;

const MESSAGE_TRANSLATIONS: Record<string, string> = {
  "Email is already registered": "البريد الإلكتروني مسجل بالفعل",
  "OTP not found": "رمز التحقق غير موجود",
  "OTP expiration not found": "بيانات صلاحية الرمز غير موجودة",
  "OTP has expired. Please request a new OTP": "انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد",
  "Invalid OTP": "رمز التحقق غير صحيح",
  "Email is already verified": "البريد الإلكتروني مفعّل بالفعل",
  "User not found": "المستخدم غير موجود",
  "Invalid email or password": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  "Please verify your email first": "يرجى تفعيل الحساب",
  "Refresh token not found": "رمز الجلسة غير موجود",
  "Invalid or expired refresh token": "رمز الجلسة غير صالح أو منتهي",
  "User account is not active": "الحساب غير نشط",
  "Unauthorized": "غير مصرح بالوصول",
  "email must be an email": "البريد الإلكتروني غير صالح",
  "name must be a string": "الاسم غير صالح",
  "password must be a string": "كلمة المرور غير صالحة",
  "phoneNumber must be a string": "رقم الهاتف غير صالح",
  "address must be a string": "العنوان غير صالح",
  "educationalStageId must be a mongodb id": "المرحلة التعليمية غير صالحة",
};

function extractErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "حدث خطأ ما";

  const raw = (data as { message?: unknown }).message;

  if (Array.isArray(raw)) {
    const translated = raw.map((item) =>
      typeof item === "string" && MESSAGE_TRANSLATIONS[item] ? MESSAGE_TRANSLATIONS[item] : item
    );
    return translated.join("، ");
  }

  if (typeof raw === "string") {
    return MESSAGE_TRANSLATIONS[raw] ?? raw;
  }

  return "حدث خطأ ما";
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  educationalStageId?: string;
}

export async function registerUser(payload: RegisterPayload): Promise<{ userId: string }> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(extractErrorMessage(data));
  }

  return data as { userId: string };
}

export interface VerifyEmailPayload {
  userId: string;
  otp: string;
}

export async function verifyEmail(payload: VerifyEmailPayload): Promise<void> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(extractErrorMessage(data));
  }
}


export class NotVerifiedError extends Error {
  constructor() {
    super("يرجى تفعيل الحساب");
    this.name = "NotVerifiedError";
  }
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  user: {
    _id: string;
    name: string;
    email: string;
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
    if (data?.message === "Please verify your email first") {
      throw new NotVerifiedError();
    }
    throw new Error(extractErrorMessage(data));
  }

  return data as LoginResult;
}

export interface EducationStage {
  id: string;
  title: string;
}

export async function fetchEducationalStages(): Promise<EducationStage[]> {
  try {
    const res = await fetch(EDUCATIONAL_STAGES_ENDPOINT);
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.stages;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

const PENDING_USER_ID_KEY = "ruqi_pending_user_id";


export function savePendingUserId(userId: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(PENDING_USER_ID_KEY, userId);
  }
}

export function getPendingUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PENDING_USER_ID_KEY);
}