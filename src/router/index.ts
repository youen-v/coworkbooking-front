import { createRouter, createWebHistory } from "vue-router";
import { apiFetch } from "../api/httpClient";

import LoginPage from "../views/public/LoginPage.vue";
import PublicRooms from "../views/public/PublicRooms.vue";
import PublicRoomDetail from "../views/public/PublicRoomDetail.vue";
import BookingStart from "../views/private/user/BookingStart.vue";
import PaymentSuccess from "../views/public/PaymentSuccess.vue";
import PaymentCancel from "../views/public/PaymentCancel.vue";
import ResourcesList from "../components/users/ResourcesList.vue";

import MyReservations from "../views/private/user/MyReservations.vue";
import ReservationEdit from "../views/private/user/ReservationEdit.vue";
import CheckoutPage from "../views/private/user/CheckoutPage.vue";
import ReservationSuccess from "../views/private/user/ReservationSuccess.vue";
import AdminDashboard from "../views/private/admin/AdminDashboard.vue";

import Error403 from "../views/public/system/Error403.vue";

function waitWindowClerkLoaded() {
  return new Promise<void>((resolve, reject) => {
    const started = Date.now();

    const t = setInterval(() => {
      const w = window as any;

      // Clerk chargé
      if (w.Clerk && w.Clerk.loaded) {
        clearInterval(t);
        resolve();
        return;
      }

      // timeout 4s pour éviter boucle infinie
      if (Date.now() - started > 4000) {
        clearInterval(t);
        reject(new Error("Clerk not loaded (timeout)"));
      }
    }, 25);
  });
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: PublicRooms, meta: { public: true } },
    { path: "/login", component: LoginPage, meta: { public: true } },

    {
      path: "/app/resources",
      component: ResourcesList,
      meta: { requiresAuth: true },
    },

    // Public
    { path: "/rooms", component: PublicRooms, meta: { public: true } },
    { path: "/rooms/:id", component: PublicRoomDetail, meta: { public: true } },
    {
      path: "/rooms/:id/book",
      component: BookingStart,
      meta: { public: true },
    },

    // Private
    {
      path: "/checkout",
      component: CheckoutPage,
      meta: { requiresAuth: true },
    },

    // Payment
    {
      path: "/payment/success",
      component: PaymentSuccess,
      meta: { public: true },
    },
    {
      path: "/payment/cancel",
      component: PaymentCancel,
      meta: { public: true },
    },
    {
      path: "/reservations",
      component: MyReservations,
      meta: { requiresAuth: true },
    },
    {
      path: "/reservations/:id/edit",
      component: ReservationEdit,
      meta: { requiresAuth: true },
    },
    {
      path: "/reservations/success",
      component: ReservationSuccess,
      meta: { requiresAuth: true },
    },

    // Admin
    {
      path: "/admin",
      component: AdminDashboard,
      meta: { requiresAuth: true, requiresAdmin: true },
    },

    // Systeme
    { path: "/403", component: Error403, meta: { public: true } },
  ],
});

router.beforeEach(async (to) => {
  if (to.meta.public) return true;

  await waitWindowClerkLoaded();

  const w = window as any;
  const clerk = w.Clerk;

  if (to.meta.requiresAuth) {
    const isSignedIn = !!clerk.user;
    if (!isSignedIn) {
      return `/login?redirectTo=${encodeURIComponent(to.fullPath)}`;
    }
  }

  if (to.meta.requiresAdmin) {
    const token = await clerk.session?.getToken?.();
    if (!token) {
      return `/login?redirectTo=${encodeURIComponent(to.fullPath)}`;
    }

    type MeResponse = { data: { role: "USER" | "ADMIN" } };

    const me = await apiFetch<MeResponse>("/api/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (me.data.role !== "ADMIN") {
      return "/403";
    }
  }

  return true;
});

export default router;
