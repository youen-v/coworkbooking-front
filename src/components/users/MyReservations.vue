<template>
  <main style="max-width:900px;margin:0 auto;padding:16px">
    <h1>Mes réservations</h1>

    <p v-if="state === 'loading'">Chargement...</p>
    <p v-else-if="state === 'error'">Erreur: {{ error }}</p>

    <p v-else-if="reservations.length === 0">Aucune réservation</p>

    <ul v-else style="display:grid;gap:12px;padding:0;list-style:none">
      <li
        v-for="r in reservations"
        :key="r.id"
        style="border:1px solid #ddd;border-radius:10px;padding:12px"
      >
        <p style="margin:0">
          <strong>{{ r.resource.name }}</strong>
          <span style="margin-left:8px">({{ r.status }})</span>
        </p>

        <small>
          {{ formatDate(r.startAt) }} → {{ formatDate(r.endAt) }}
        </small>

        <div style="display:flex;gap:8px;margin-top:10px">
          <button @click="openEdit(r)">Modifier</button>
          <button @click="cancel(r.id)" :disabled="busyId === r.id">🗑 Annuler</button>
        </div>

        <p v-if="busyId === r.id" style="color:#999;margin-top:6px">Traitement...</p>
      </li>
    </ul>

    <div
      v-if="editing"
      style="position:fixed;inset:0;background:rgba(0,0,0,.4);display:grid;place-items:center;padding:16px"
    >
      <div style="background:white;padding:16px;border-radius:12px;max-width:420px;width:100%">
        <h2>Modifier</h2>

        <label style="display:block;margin:10px 0">
          Début
          <input type="datetime-local" v-model="editStartAt" />
        </label>

        <label style="display:block;margin:10px 0">
          Durée (minutes)
          <input type="number" v-model.number="editDuration" min="30" />
        </label>

        <p style="background:#f5f5f5;padding:10px;border-radius:8px">
          <strong>Fin calculée :</strong> {{ editComputedEndAt }}
        </p>

        <p v-if="editError" style="color:red">{{ editError }}</p>

        <div style="display:flex;gap:8px;margin-top:12px">
          <button @click="saveEdit" :disabled="editBusy">
            {{ editBusy ? "..." : "Sauvegarder" }}
          </button>
          <button @click="closeEdit" :disabled="editBusy">Fermer</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { cancelReservation, myReservations, updateReservation } from "../../api/reservations.api";

const reservations = ref<any[]>([]);
const state = ref<"loading" | "error" | "success">("loading");
const error = ref("");

const busyId = ref<string | null>(null);

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

async function load() {
  state.value = "loading";
  error.value = "";
  try {
    const res = await myReservations();
    reservations.value = res.data;
    state.value = "success";
  } catch (e: any) {
    state.value = "error";
    error.value = e?.message || "Erreur inconnue";
  }
}

onMounted(load);

async function cancel(id: string) {
  if (!confirm("Confirmer l'annulation ?")) return;

  busyId.value = id;
  try {
    await cancelReservation(id);
    await load();
  } catch (e: any) {
    alert(e?.message || "Erreur");
  } finally {
    busyId.value = null;
  }
}

const editing = ref<any>(null);
const editStartAt = ref("");
const editDuration = ref(60);
const editBusy = ref(false);
const editError = ref("");

const editComputedEndAt = computed(() => {
  if (!editStartAt.value) return "(choisir une date)";
  const start = new Date(editStartAt.value);
  const end = new Date(start.getTime() + editDuration.value * 60_000);
  return end.toISOString();
});

function openEdit(r: any) {
  editing.value = r;

  const start = new Date(r.startAt);
  editStartAt.value = start.toISOString().slice(0, 16);

  const d = (new Date(r.endAt).getTime() - new Date(r.startAt).getTime()) / 60_000;
  editDuration.value = Math.max(30, Math.floor(d));

  editError.value = "";
}

function closeEdit() {
  editing.value = null;
}

async function saveEdit() {
  editBusy.value = true;
  editError.value = "";

  try {
    const start = new Date(editStartAt.value);
    const end = new Date(start.getTime() + editDuration.value * 60_000);

    await updateReservation(editing.value.id, {
      resourceId: editing.value.resourceId,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
    });

    closeEdit();
    await load();
  } catch (e: any) {
    if (e?.status === 409) {
      editError.value = "Oups! Nous sommes désoler ce crénaux est déjà réservé, veuillez choisir un autre horaire.";
    } else {
      editError.value = e?.message || "Erreur inconnue";
    }
  } finally {
    editBusy.value = false;
  }
}
</script>
