<template>
  <main style="max-width:900px;margin:0 auto;padding:16px">
    <p>
      <RouterLink :to="`/app/resources/${id}`">⬅ Retour</RouterLink>
    </p>

    <h1>Réservation</h1>

    <p v-if="state === 'loading'">Chargement...</p>
    <p v-else-if="state === 'error'">Erreur: {{ error }}</p>

    <form v-else @submit.prevent="submit" style="display:grid;gap:12px;max-width:420px">
      <h2>{{ resource.name }}</h2>

      <label>
        Début
        <input type="datetime-local" v-model="startAt" required />
      </label>

      <label>
        Durée (minutes)
        <input
          type="number"
          v-model.number="duration"
          :min="resource.durationMin"
          :max="resource.durationMax"
          required
        />
        <small>
          Min {{ resource.durationMin }} / Max {{ resource.durationMax }}
        </small>
      </label>

      <p style="padding:10px;background:#f5f5f5;border-radius:8px">
        <strong>Fin calculée :</strong> {{ computedEndAt }}
      </p>

      <button type="submit" :disabled="submitState === 'loading'">
        {{ submitState === "loading" ? "Réservation..." : "Confirmer" }}
      </button>

      <p v-if="submitState === 'success'" style="color:green">
        Réservation créée !
      </p>

      <p v-if="submitState === 'error'" style="color:red">
        {{ submitError }}
      </p>
    </form>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getResource } from "../../api/resources.api";
import { createReservation } from "../../api/reservations.api";

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

const resource = ref<any>(null);
const state = ref<"loading" | "error" | "success">("loading");
const error = ref("");

const startAt = ref("");
const duration = ref(60);

const submitState = ref<"idle" | "loading" | "error" | "success">("idle");
const submitError = ref("");

const computedEndAt = computed(() => {
  if (!startAt.value) return "(choisis une date)";
  const start = new Date(startAt.value);
  const end = new Date(start.getTime() + duration.value * 60_000);
  return end.toISOString();
});

onMounted(async () => {
  try {
    const res = await getResource(id);
    resource.value = res.data;
    duration.value = res.data.durationMin;
    state.value = "success";
  } catch (e: any) {
    state.value = "error";
    error.value = e?.message || "Erreur inconnue";
  }
});

async function submit() {
  submitState.value = "loading";
  submitError.value = "";

  try {
    if (!startAt.value) throw new Error("startAt manquant");

    const start = new Date(startAt.value);
    const end = new Date(start.getTime() + duration.value * 60_000);

    await createReservation({
      resourceId: id,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
    });

    submitState.value = "success";

    // redirige vers les réservations
    setTimeout(() => router.push("/app/reservations"), 500);
  } catch (e: any) {
    submitState.value = "error";

    if (e?.status === 409) {
      submitError.value = "Créneau déjà réservé. Choisis un autre horaire.";
    } else {
      submitError.value = e?.message || "Erreur inconnue";
    }
  }
}
</script>
