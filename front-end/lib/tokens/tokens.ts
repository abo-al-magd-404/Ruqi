// ============= Tokens =============
// Access/refresh token persistence in localStorage (SSR-safe) plus the
// refresh flow used to recover an expired access token. Also exports the
// API base URL consumed by the rest of the lib layer.

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

  // Post the refresh token to the auth endpoint. On success the new pair is
  // saved over the old tokens so the caller can retry its failed request;
  // on any failure we return false so the caller clears the session.
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

  // Backend may return the pair at the top level OR nested under "tokens";
  // read whichever shape is present.
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