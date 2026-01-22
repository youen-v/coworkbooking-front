<template>
  <main style="max-width:700px;margin:0 auto;padding:16px">
    <h1>Paiement</h1>

    <p v-if="state==='loading'">Redirection vers Stripe...</p>
    <p v-else-if="state==='error'" style="color:red">
      Erreur : {{ error }}
    </p>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { authedFetch } from "../../../api/authedFetch";

const route = useRoute();
const reservationId = route.query.reservationId as string;

const state = ref<"loading"|"error">("loading");
const error = ref("");

onMounted(async () => {
  try {
    const res = await authedFetch<{ data: { url: string } }>("/api/v1/payments/checkout-session", {
      method: "POST",
      body: JSON.stringify({ reservationId }),
    });

    window.location.href = res.data.url;
  } catch (e:any) {
    state.value = "error";
    error.value = e?.message || "Erreur checkout";
  }
});
</script>
