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
  ],
});

router.beforeEach(async (to) => {
  if (to.meta.public) return true;
  return true;
});

export default router;
