const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  // Auto-refresh token on 401
  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      res = await fetch(`${API_BASE}${endpoint}`, {
        ...fetchOptions,
        headers,
        credentials: 'include',
      });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.data ?? data;
}