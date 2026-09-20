import {
  API_BASE_URL,
  getAccessToken,
  clearTokens,
  refreshAccessToken,
} from "../tokens/tokens";

export { API_BASE_URL };

const PENDING_EMAIL_KEY = "ruqi_pending_email";
const PENDING_NAME_KEY = "ruqi_pending_name";

export function savePendingEmail(email: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(PENDING_EMAIL_KEY, email);
  }
}

export function getPendingEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PENDING_EMAIL_KEY);
}

export function clearPendingEmail() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(PENDING_EMAIL_KEY);
  }
}

export function savePendingName(name: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(PENDING_NAME_KEY, name);
  }
}

export function getPendingName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PENDING_NAME_KEY);
}

export function clearPendingName() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(PENDING_NAME_KEY);
  }
}

// ============= HTTP Helpers =============

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function safeJson(res: Response): Promise<any> {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    throw new Error(
      res.ok ? "استجابة غير متوقعة من الخادم" : "تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً"
    );
  }
  return res.json();
}

export function formatApiError(data: unknown): string {
  if (!data || typeof data !== "object") return "حدث خطأ ما";

  const raw = (data as { message?: unknown }).message;

  if (Array.isArray(raw)) {
    return raw.filter((i): i is string => typeof i === "string").join("، ");
  }

  if (typeof raw === "string") return raw;

  return "حدث خطأ ما";
}

export async function authedFetch(url: string, init: RequestInit = {}): Promise<Response> {
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
    } else {
      clearTokens();
    }
  }

  return res;
}

export async function authedJson<T = unknown>(url: string, method: string, body?: unknown): Promise<T> {
  const payload = body !== undefined ? { body: JSON.stringify(body) } : {};
  const res = await authedFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...payload,
  });
  const data = await safeJson(res);
  if (!res.ok) {
    if (res.status === 401) clearTokens();
    const error = new Error(formatApiError(data)) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
  return data as T;
}

// For mutations whose response has no JSON body (e.g. backend DELETE/reorder
// returning void => 200/204 with empty body). Treats any 2xx as success.
export async function authedWrite(url: string, method: string, body?: unknown): Promise<void> {
  const payload = body !== undefined ? { body: JSON.stringify(body) } : {};
  const res = await authedFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...payload,
  });
  if (!res.ok) {
    if (res.status === 401) clearTokens();
    const data = await safeJson(res).catch(() => ({}));
    const error = new Error(formatApiError(data)) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
}