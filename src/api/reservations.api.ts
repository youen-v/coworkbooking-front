import { authedFetch } from "./authedFetch";

export function createReservation(payload: any) {
  return authedFetch<{ data: any }>("/api/v1/reservations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function myReservations() {
  return authedFetch<{ data: any[] }>("/api/v1/reservations/me");
}
