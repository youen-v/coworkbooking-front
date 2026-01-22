<template>
  <main style="max-width:700px;margin:0 auto;padding:16px">
    <p>
      <RouterLink :to="`/rooms/${id}`">⬅ Retour à la salle</RouterLink>
    </p>

    <h1>Finaliser réservation</h1>

    <section style="border:1px solid #ddd;border-radius:12px;padding:12px;margin-top:12px">
      <p style="margin:0"><strong>Salle :</strong> {{ id }}</p>

      <p style="margin:6px 0">
        <strong>Début :</strong>
        <span>{{ formatDate(startAt) }}</span>
      </p>

      <p style="margin:6px 0">
        <strong>Fin :</strong>
        <span>{{ formatDate(endAt) }}</span>
      </p>
    </section>

    <div style="margin-top:16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <button @click="confirm" :disabled="state === 'loading'">
        {{ state === "loading" ? "Création..." : "Confirmer la réservation" }}
      </button>

      <RouterLink to="/rooms">Changer de salle</RouterLink>
    </div>

    <p v-if="state === 'error'" style="color:red;margin-top:12px">
      {{ error }}
    </p>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@clerk/vue";
import { createReservation } from "../../api/reservations.api";

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id as string);
const startAt = computed(() => route.query.startAt as string);
const endAt = computed(() => route.query.endAt as string);

const state = ref<"idle" | "loading" | "error">("idle");
const error = ref("");

const { isLoaded, isSignedIn, getToken } = useAuth();
function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

onMounted(async () => {
  // Attend Clerk
  if (!isLoaded.value) return;

  // Si pas connecté redirection vers le login
  if (!isSignedIn.value) {
    router.push(`/login?redirectTo=${encodeURIComponent(route.fullPath)}`);
    return;
  }

  // Check URL
  if (!startAt.value || !endAt.value) {
    state.value = "error";
    error.value = "Créneau invalide (startAt/endAt manquant). Retourne choisir un horaire.";
  }
});

async function confirm() {
  state.value = "loading";
  error.value = "";

  try {
    const token = await getToken.value?.();

    if (!token) throw new Error("Token Clerk manquant");

    if (!startAt.value || !endAt.value) {
      throw new Error("Créneau invalide (startAt/endAt manquant).");
    }

    const created = await createReservation(token, {
      resourceId: id.value,
      startAt: startAt.value,
      endAt: endAt.value,
    });

    // Redirection vers le paiement
    router.push(`/checkout?reservationId=${created.data.id}`);
  } catch (e: any) {
    state.value = "error";
    error.value = e?.message || "Erreur inconnue";
  }
}
</script>
