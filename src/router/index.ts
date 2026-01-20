import { createRouter, createWebHistory } from "vue-router";
import LandingPage from "../views/public/LandingPage.vue";
import LoginPage from "../views/public/LoginPage.vue";

import ResourcesList from "../components/users/ResourcesList.vue";

import { useAuth } from "@clerk/vue";
import { useAuthStore } from "../stores/auth.store";

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
  ],
});

router.beforeEach(async (to) => {
  // route public
  if (to.meta.public) return true;

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
