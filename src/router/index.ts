import { createRouter, createWebHistory } from "vue-router";
import LandingPage from "../views/public/LandingPage.vue";
import LoginPage from "../views/public/LoginPage.vue";
import PublicRooms from "../views/public/PublicRooms.vue";
import PublicRoomDetail from "../views/public/PublicRoomDetail.vue";
import BookingStart from "../views/public/BookingStart.vue";
import PaymentSuccess from "../views/public/PaymentSuccess.vue";
import PaymentCancel from "../views/public/PaymentCancel.vue";

import ResourcesList from "../components/users/ResourcesList.vue";

import CheckoutPage from "../views/private/user/CheckoutPage.vue";

import { useAuth } from "@clerk/vue";
import { useAuthStore } from "../stores/auth.store";

function waitClerkLoaded() {
  const { isLoaded } = useAuth();

  return new Promise<void>((resolve) => {
    const t = setInterval(() => {
      if (isLoaded.value) {
        clearInterval(t);
        resolve();
      }
    }, 25);
  });
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: LandingPage, meta: { public: true } },
    { path: "/login", component: LoginPage, meta: { public: true } },

    {
      path: "/app/resources",
      component: ResourcesList,
      meta: { requiresAuth: true },
    },

    // Page avec accès public
    { path: "/rooms", component: PublicRooms, meta: { public: true } },
    { path: "/rooms/:id", component: PublicRoomDetail, meta: { public: true } },
    {
      path: "/rooms/:id/book",
      component: BookingStart,
      meta: { public: true },
    },

    // Page avec accès utilisateur
    {
      path: "/checkout",
      component: CheckoutPage,
      meta: { requiresAuth: true },
    },

    // Succés du paiement
    {
      path: "/payment/success",
      component: PaymentSuccess,
      meta: { public: true },
    },

    // Paiement annulé
    {
      path: "/payment/cancel",
      component: PaymentCancel,
      meta: { public: true },
    },
  ],
});

router.beforeEach(async (to) => {
  // route public
  if (to.meta.public) return true;

  await waitClerkLoaded();

  // Check d'authentification
  const { isSignedIn } = useAuth();
  if (!isSignedIn.value) return "/login";

  // Check des rôles
  const authStore = useAuthStore();
  if (!authStore.loaded) {
    await authStore.fetchMe();
  }

  if (to.meta.requiresAdmin && authStore.role !== "ADMIN") {
    return "/403";
  }

  return true;
});

export default router;
