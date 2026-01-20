const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) throw json;
  return json as T;
}
