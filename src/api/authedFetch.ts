import { apiFetch } from "./httpClient";
import { useAuth } from "@clerk/vue";

export async function authedFetch<T>(path: string, init?: RequestInit) {
  const { getToken } = useAuth();
  const token = await getToken.value();

  return apiFetch<T>(path, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}
