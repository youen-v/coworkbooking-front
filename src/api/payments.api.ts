import { authedFetch } from "./authedFetch";

export function createCheckoutSession(token: string, reservationId: string) {
  return authedFetch<{ data: { url: string } }>(
    token,
    "/api/v1/payments/checkout-session",
    {
      method: "POST",
      body: JSON.stringify({ reservationId }),
    },
  );
}
