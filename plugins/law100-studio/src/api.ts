export type StudioConfig = {
  restRoot: string;
  nonce: string;
  homeUrl: string;
  driveUrl: string;
  studioUrl: string;
};

const root = document.getElementById('law100-studio');

export const config: StudioConfig = {
  restRoot: root?.dataset.restRoot || '/wp-json',
  nonce: root?.dataset.restNonce || '',
  homeUrl: root?.dataset.homeUrl || '/',
  driveUrl: root?.dataset.driveUrl || '/drive/',
  studioUrl: root?.dataset.studioUrl || '/studio/',
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('X-WP-Nonce', config.nonce);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`${config.restRoot}${path}`, {
    ...init,
    headers,
    credentials: 'same-origin',
  });
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 || response.status === 403 && (data as { code?: string } | null)?.code === 'rest_cookie_invalid_nonce') {
      window.dispatchEvent(new CustomEvent('studio:session-expired'));
    }
    const message = (data as { message?: string } | null)?.message || '请求没有完成。';
    throw new ApiError(message, response.status, data);
  }
  return data as T;
}

export function json(body: unknown): RequestInit {
  return { body: JSON.stringify(body) };
}
