<template>
  <main style="max-width:700px;margin:0 auto;padding:16px">
    <h1>Paiement</h1>

    <p v-if="state==='loading'">Redirection vers Stripe...</p>
    <p v-else-if="state==='error'" style="color:red">
      {{ error }}
    </p>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@clerk/vue";
import { createCheckoutSession } from "../../../api/payments.api";

const route = useRoute();
const router = useRouter();

const reservationId = route.query.reservationId as string;

const state = ref<"loading"|"error">("loading");
const error = ref("");

const { isLoaded, isSignedIn, getToken } = useAuth();

onMounted(async () => {
  try {
    if (!isLoaded.value) return;

    if (!isSignedIn.value) {
      router.push(`/login?redirectTo=${encodeURIComponent(route.fullPath)}`);
      return;
    }

    const token = await getToken.value();
    if (!token) throw new Error("Token Clerk manquant");

    const res = await createCheckoutSession(token, reservationId);
    window.location.href = res.data.url;
  } catch (e: any) {
    state.value = "error";
    error.value = e?.message || "Erreur checkout";
  }
});
</script>
