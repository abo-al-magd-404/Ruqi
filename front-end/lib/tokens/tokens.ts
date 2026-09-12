export const API_BASE_URL = "/api/backend";

// ============= Token Management =============
const ACCESS_TOKEN_KEY = "ruqi_access_token";
const REFRESH_TOKEN_KEY = "ruqi_refresh_token";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function saveTokens(tokens: TokenPair): void {
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

export function clearTokens(): void {
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

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return false;
  }
  if (!data || typeof data !== "object") return false;

  const record = data as {
    accessToken?: unknown;
    refreshToken?: unknown;
    tokens?: { accessToken?: unknown; refreshToken?: unknown };
  };

  const accessToken = record.accessToken ?? record.tokens?.accessToken;
  const refresh = record.refreshToken ?? record.tokens?.refreshToken;

  if (!accessToken || !refresh) return false;

  saveTokens({ accessToken: accessToken as string, refreshToken: refresh as string });
  return true;
}