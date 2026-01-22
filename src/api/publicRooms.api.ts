import { apiFetch } from "./httpClient";

export function getPublicRooms() {
  return apiFetch<{ data: any[] }>("/api/v1/resources");
}

export function getPublicRoom(id: string) {
  return apiFetch<{ data: any }>(`/api/v1/resources/${id}`);
}

export function getRoomSlots(id: string, date: string, duration = 60) {
  return apiFetch<{ data: { startAt: string; endAt: string }[] }>(
    `/api/v1/resources/${id}/slots?date=${date}&duration=${duration}`,
  );
}
