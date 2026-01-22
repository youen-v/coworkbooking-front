import { authedFetch } from "./authedFetch";

export function createReservation(payload: any) {
  return authedFetch<{ data: any }>("/api/v1/reservations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateReservation(id: string, payload: any) {
  return authedFetch<{ data: any }>(`/api/v1/reservations/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function cancelReservation(id: string) {
  return authedFetch<{ data: any }>(`/api/v1/reservations/${id}`, {
    method: "DELETE",
  });
}

export function myReservations() {
  return authedFetch<{ data: any[] }>("/api/v1/reservations/me");
}
