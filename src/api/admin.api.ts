import { authedFetch } from "./authedFetch";

export function adminStats(token: string) {
  return authedFetch<{ data: any }>(token, "/api/v1/admin/stats");
}

export function adminReservations(token: string, qs = "") {
  return authedFetch<{ data: any[] }>(token, `/api/v1/admin/reservations${qs}`);
}

export function adminUsers(token: string, q = "") {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  return authedFetch<{ data: any[] }>(token, `/api/v1/admin/users${qs}`);
}

export function adminResources(token: string) {
  return authedFetch<{ data: any[] }>(token, "/api/v1/admin/resources");
}

export function adminCancelReservation(token: string, id: string) {
  return authedFetch<{ data: any }>(
    token,
    `/api/v1/admin/reservations/${id}/cancel`,
    {
      method: "PATCH",
    },
  );
}
