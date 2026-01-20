import { authedFetch } from "./authedFetch";

export function getResources() {
  return authedFetch<{ data: any[] }>("/api/v1/resources");
}

export function getResource(id: string) {
  return authedFetch<{ data: any }>(`/api/v1/resources/${id}`);
}
