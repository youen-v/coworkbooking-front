import { authedFetch } from "./authedFetch";

export function getReservation(token: string, id: string) {
  return authedFetch<{ data: any }>(token, `/api/v1/reservations/${id}`);
}

export function createReservation(token: string, payload: any) {
  return authedFetch<{ data: any }>(token, "/api/v1/reservations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function myReservations(token: string) {
  return authedFetch<{ data: any[] }>(token, "/api/v1/reservations/me");
}

export function updateReservation(token: string, id: string, payload: any) {
  return authedFetch<{ data: any }>(token, `/api/v1/reservations/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function cancelReservation(token: string, id: string) {
  return authedFetch<{ data: any }>(token, `/api/v1/reservations/${id}`, {
    method: "DELETE",
  });
}
