<template>
  <main style="max-width: 700px; margin: 0 auto; padding: 16px">
    <h1>Finaliser réservation</h1>

    <p><strong>Début :</strong> {{ startAt }}</p>
    <p><strong>Fin :</strong> {{ endAt }}</p>

    <button @click="confirm" :disabled="state === 'loading'">
      {{ state === "loading" ? "Création..." : "Confirmer la réservation" }}
    </button>

    <p v-if="state === 'error'" style="color: red">{{ error }}</p>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@clerk/vue";
import { createReservation } from "../../api/reservations.api";

const route = useRoute();
const router = useRouter();

const id = route.params.id as string;
const startAt = route.query.startAt as string;
const endAt = route.query.endAt as string;

const state = ref<"idle" | "loading" | "error">("idle");
const error = ref("");

const { isLoaded, isSignedIn } = useAuth();

onMounted(() => {
  if (!isLoaded.value) return;

  // Auth forcé seulement à la réservation
  if (!isSignedIn.value) {
   router.push(`/login?redirectTo=${encodeURIComponent(route.fullPath)}`);
  }
});

async function confirm() {
  state.value = "loading";
  error.value = "";

  try {
    // Paiement
    const created = await createReservation({
      resourceId: id,
      startAt,
      endAt,
    });

    router.push(`/checkout?reservationId=${created.data.id}`);
  } catch (e: any) {
    state.value = "error";
    error.value = e?.message || "Erreur";
  }
}
</script>
