<template>
  <main style="max-width: 900px; margin: 0 auto; padding: 16px">
    <RouterLink to="/reservations">⬅ Retour</RouterLink>

    <h1 style="margin-top: 12px">Modifier ma réservation</h1>

    <p v-if="state === 'loading'">Chargement...</p>

    <p v-else-if="state === 'error'" style="color: red">
      {{ error }}
    </p>

    <section
      v-else
      style="
        border: 1px solid #ddd;
        border-radius: 12px;
        padding: 14px;
        margin-top: 12px;
      "
    >
      <h3 style="margin: 0">Réservation actuelle</h3>

      <p style="margin: 6px 0; opacity: 0.85">
        <strong>Salle :</strong> {{ currentReservation?.resource?.name }}
      </p>

      <p style="margin: 6px 0; opacity: 0.85">
        <strong>Créneau :</strong>
        {{ formatDate(currentReservation.startAt) }} →
        {{ formatDate(currentReservation.endAt) }}
      </p>

      <p style="margin: 6px 0">
        <strong>Statut :</strong>
        <span :style="badgeStyle(currentReservation.status)">
          {{ currentReservation.status }}
        </span>
      </p>
    </section>

    <section
      v-if="state === 'success'"
      style="
        margin-top: 16px;
        border: 1px solid #ddd;
        border-radius: 12px;
        padding: 14px;
      "
    >
      <h3 style="margin: 0 0 10px 0">Nouvelle réservation</h3>

      <div style="display: grid; gap: 12px; max-width: 520px">
        <!-- Salle -->
        <label style="display: grid; gap: 6px">
          <span><strong>Salle</strong></span>
          <select
            v-model="form.resourceId"
            style="padding: 8px; border-radius: 8px; border: 1px solid #ddd"
          >
            <option v-for="r in rooms" :key="r.id" :value="r.id">
              {{ r.name }}
            </option>
          </select>
        </label>

        <!-- Créneaux disponibles -->
        <section style="margin-top: 16px">
          <h3 style="margin: 0 0 10px 0">Créneaux disponibles</h3>

          <p v-if="slotsState === 'loading'">Chargement des créneaux...</p>

          <p v-else-if="slotsState === 'error'" style="color: red">
            {{ slotsError }}
          </p>

          <p v-else-if="slots.length === 0" style="opacity: 0.7">
            Aucun créneau disponible pour cette salle.
          </p>

          <div v-else style="display: grid; gap: 14px">
            <div
              v-for="group in groupedSlots"
              :key="group.dateKey"
              style="border: 1px solid #eee; border-radius: 12px; padding: 10px"
            >
              <strong>{{ group.label }}</strong>

              <div
                style="
                  display: flex;
                  flex-wrap: wrap;
                  gap: 8px;
                  margin-top: 10px;
                "
              >
                <button
                  v-for="slot in group.items"
                  :key="slot.startAt"
                  @click="selectSlot(slot)"
                  :style="slotButtonStyle(slot)"
                >
                  {{ formatTime(slot.startAt) }} → {{ formatTime(slot.endAt) }}
                </button>
              </div>
            </div>
          </div>

          <p v-if="selectedSlot" style="margin-top: 12px">
            Créneau sélectionné :
            <strong
              >{{ formatDate(selectedSlot.startAt) }} →
              {{ formatDate(selectedSlot.endAt) }}</strong
            >
          </p>
        </section>

        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px">
          <button
            @click="save"
            :disabled="actionState === 'loading'"
            style="cursor: pointer"
          >
            {{
              actionState === "loading"
                ? "Enregistrement..."
                : "Enregistrer les modifications"
            }}
          </button>

          <button
            @click="cancel"
            :disabled="actionState === 'loading'"
            style="cursor: pointer"
          >
            Annuler la réservation
          </button>
        </div>

        <p v-if="actionState === 'error'" style="color: red; margin: 0">
          {{ actionError }}
        </p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@clerk/vue";
import { apiFetch } from "../../../api/httpClient";
import {
  getReservation,
  updateReservation,
  cancelReservation,
} from "../../../api/reservations.api";

const route = useRoute();
const router = useRouter();
const reservationId = route.params.id as string;

const { isLoaded, isSignedIn, getToken } = useAuth();

const state = ref<"loading" | "error" | "success">("loading");
const error = ref("");

const currentReservation = ref<any>(null);
const rooms = ref<any[]>([]);

const slots = ref<{ startAt: string; endAt: string }[]>([]);
const slotsState = ref<"idle" | "loading" | "error" | "success">("idle");
const slotsError = ref("");

const selectedSlot = ref<{ startAt: string; endAt: string } | null>(null);

const actionState = ref<"idle" | "loading" | "error" | "success">("idle");
const actionError = ref("");

const form = reactive({
  resourceId: "",
});

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function dateKey(iso: string) {
  const d = new Date(iso);
  // YYYY-MM-DD
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

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

const groupedSlots = computed(() => {
  const map = new Map<
    string,
    { dateKey: string; label: string; items: any[] }
  >();

  for (const s of slots.value) {
    const key = dateKey(s.startAt);
    if (!map.has(key)) {
      const d = new Date(s.startAt);
      map.set(key, {
        dateKey: key,
        label: d.toLocaleDateString(),
        items: [],
      });
    }
    map.get(key)!.items.push(s);
  }

  return Array.from(map.values());
});

async function loadSlots(resourceId: string) {
  try {
    slotsState.value = "loading";
    slotsError.value = "";
    slots.value = [];
    selectedSlot.value = null;

    if (!resourceId) return;

    const res = await apiFetch<{ data: { startAt: string; endAt: string }[] }>(
      `/api/v1/public/resources/${resourceId}/slots`,
    );

    slots.value = res.data;
    slotsState.value = "success";

    // Si le créneau actuel existe toujours dans les dispos => préselect
    const current = currentReservation.value;
    if (current) {
      const match = slots.value.find(
        (s) =>
          s.startAt === new Date(current.startAt).toISOString() &&
          s.endAt === new Date(current.endAt).toISOString(),
      );

      if (match) {
        selectedSlot.value = match;
      }
    }
  } catch (e: any) {
    slotsState.value = "error";
    slotsError.value = e?.message || "Impossible de charger les créneaux";
  }
}

watch(
  () => form.resourceId,
  (newVal) => {
    loadSlots(newVal);
  },
);

function selectSlot(slot: { startAt: string; endAt: string }) {
  selectedSlot.value = slot;
}

function slotButtonStyle(slot: { startAt: string; endAt: string }) {
  const isSelected =
    selectedSlot.value?.startAt === slot.startAt &&
    selectedSlot.value?.endAt === slot.endAt;

  return `
    padding:8px 10px;
    border-radius:10px;
    border:1px solid ${isSelected ? "#333" : "#ddd"};
    background:${isSelected ? "#333" : "white"};
    color:${isSelected ? "white" : "black"};
    cursor:pointer;
  `;
}

onMounted(async () => {
  try {
    state.value = "loading";
    error.value = "";

    await waitClerkLoaded();

    if (!isSignedIn.value) {
      router.push(`/login?redirectTo=${encodeURIComponent(route.fullPath)}`);
      return;
    }

    const token = await getToken.value?.();
    if (!token) throw new Error("Token Clerk manquant");

    // Récupération de la réservation à éditer
    const one = await getReservation(token, reservationId);
    const found = one.data;

    currentReservation.value = found;

    // Charge les rooms disponibles (public)
    const r = await apiFetch<{ data: any[] }>("/api/v1/public/resources");
    rooms.value = r.data;

    // Si la ressource actuelle n'est pas dans la liste, on l'ajoute
    if (
      found.resource &&
      !rooms.value.some((x: any) => x.id === found.resource.id)
    ) {
      rooms.value.unshift(found.resource);
    }

    // Pré-remplir le form (là on est sûr d’avoir resourceId)
    form.resourceId = found.resourceId ?? found.resource?.id ?? "";
    await loadSlots(form.resourceId);

    if (!form.resourceId) {
      throw new Error(
        "Salle invalide : resourceId introuvable dans la réservation",
      );
    }

    state.value = "success";
  } catch (e: any) {
    state.value = "error";
    error.value = e?.message || "Erreur";
  }
});

async function save() {
  try {
    actionState.value = "loading";
    actionError.value = "";

    const token = await getToken.value?.();
    if (!token) throw new Error("Token Clerk manquant");

    if (!selectedSlot.value) {
      throw new Error("Tu dois choisir un créneau disponible.");
    }

    const updated = await updateReservation(token, reservationId, {
      resourceId: form.resourceId.trim(),
      startAt: selectedSlot.value.startAt,
      endAt: selectedSlot.value.endAt,
    });

    // Refresh affichage local
    currentReservation.value = updated.data;

    actionState.value = "success";

    setTimeout(() => {
      router.push("/reservations/success");
    }, 300);
  } catch (e: any) {
    actionState.value = "error";
    actionError.value = e?.message || "Erreur";
  }
}

async function cancel() {
  try {
    actionState.value = "loading";
    actionError.value = "";

    const token = await getToken.value?.();
    if (!token) throw new Error("Token Clerk manquant");

    await cancelReservation(token, reservationId);

    actionState.value = "success";

    // retour à la liste
    setTimeout(() => {
      router.push("/reservations");
    }, 500);
  } catch (e: any) {
    actionState.value = "error";
    actionError.value = e?.message || "Erreur";
  }
}
</script>
