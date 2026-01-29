<template>
  <main style="max-width: 900px; margin: 0 auto; padding: 16px">
    <h1>Mes réservations</h1>

    <p v-if="state === 'loading'">Chargement...</p>

    <p v-else-if="state === 'error'" style="color: red">❌ {{ error }}</p>

    <div v-else>
      <p v-if="reservations.length === 0" style="opacity: 0.7">
        Aucune réservation trouvée.
      </p>

      <ul v-else style="display: grid; gap: 12px; padding: 0; list-style: none">
        <li
          v-for="r in reservations"
          :key="r.id"
          style="border: 1px solid #ddd; border-radius: 12px; padding: 12px"
        >
          <div
            style="
              display: flex;
              justify-content: space-between;
              gap: 10px;
              flex-wrap: wrap;
            "
          >
            <div>
              <h3 style="margin: 0">
                {{ r.resource?.name || "Ressource" }}
              </h3>

              <p style="margin: 6px 0; opacity: 0.8">
                {{ formatDate(r.startAt) }} → {{ formatDate(r.endAt) }}
              </p>

              <p style="margin: 6px 0">
                <strong>Statut :</strong>
                <span :style="badgeStyle(r.status)">{{ r.status }}</span>
              </p>
            </div>

            <div
              v-if="r.status === 'PENDING_PAYMENT'"
              style="display: flex; align-items: center"
            >
              <RouterLink :to="`/checkout?reservationId=${r.id}`">
                Payer maintenant →
              </RouterLink>
            </div>
            <div>
              <RouterLink
                v-if="r.status !== 'CANCELLED'"
                :to="`/reservations/${r.id}/edit`"
              >
                Modifier →
              </RouterLink>
              <button
                v-if="r.status !== 'CANCELLED'"
                @click="cancel(r.id)"
                style="cursor: pointer"
              >
                Annuler
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@clerk/vue";
import { myReservations, cancelReservation } from "../../../api/reservations.api";

const router = useRouter();
const route = useRoute();

const state = ref<"loading" | "error" | "success">("loading");
const error = ref("");

const reservations = ref<any[]>([]);

const { isLoaded, isSignedIn, getToken } = useAuth();

function formatDate(value: string) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function badgeStyle(status: string) {
  if (status === "ACTIVE") return "color:green;font-weight:700";
  if (status === "PENDING_PAYMENT") return "color:orange;font-weight:700";
  if (status === "CANCELLED") return "color:#999;font-weight:700";
  return "font-weight:700";
}

async function waitClerkLoaded() {
  while (!isLoaded.value) {
    await new Promise((r) => setTimeout(r, 25));
  }
}

onMounted(async () => {
  try {
    await waitClerkLoaded();
    state.value = "loading";
    error.value = "";

    if (!isLoaded.value) return;

    // Si pas connecté retour à la page login
    if (!isSignedIn.value) {
      router.push(`/login?redirectTo=${encodeURIComponent(route.fullPath)}`);
      return;
    }

    // Récupération du token Clerk
    const token = await getToken.value?.();
    if (!token) throw new Error("Token Clerk manquant");

    const res = await myReservations(token);
    reservations.value = res.data;

    state.value = "success";
  } catch (e: any) {
    state.value = "error";
    error.value = e?.message || "Erreur inconnue";
  }
});

async function cancel(id: string) {
  try {
    const token = await getToken.value?.();
    if (!token) throw new Error("Token manquant");

    await cancelReservation(token, id);

    // refresh list
    const res = await myReservations(token);
    reservations.value = res.data;
  } catch (e: any) {
    alert(e?.message || "Erreur annulation");
  }
}
</script>
