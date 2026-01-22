import { defineStore } from "pinia";
import { apiFetch } from "../api/httpClient";

type Role = "USER" | "ADMIN";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    loaded: false,
    role: "USER" as Role,
    email: "",
  }),

  actions: {
    async fetchMe(token: string) {
      const res = await apiFetch<{ data: any }>("/api/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      this.role = res.data.role;
      this.email = res.data.email;
      this.loaded = true;
    },

    reset() {
      this.loaded = false;
      this.role = "USER";
      this.email = "";
    },
  },
});
