import { apiFetch } from "./httpClient";

export async function authedFetch<T>(
  token: string,
  path: string,
  init?: RequestInit,
) {
  return apiFetch<T>(path, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}
