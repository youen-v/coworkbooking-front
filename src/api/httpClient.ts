const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();

    let payload: any = null;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }

    const message =
      payload?.message || payload?.error || `HTTP ${res.status} sur ${path}`;

    const err: any = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return res.json();
}
