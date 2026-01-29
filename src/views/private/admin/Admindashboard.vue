<template>
  <main style="max-width: 1100px; margin: 0 auto; padding: 16px">
    <header
      style="
        display: flex;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        align-items: center;
      "
    >
      <h1 style="margin: 0">Dashboard Admin</h1>

      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <button @click="tab = 'overview'" :style="tabStyle('overview')">
          Vue globale
        </button>
        <button @click="tab = 'users'" :style="tabStyle('users')">
          Par utilisateur
        </button>
        <button @click="tab = 'rooms'" :style="tabStyle('rooms')">
          Par salle
        </button>
      </div>
    </header>

    <p v-if="state === 'loading'" style="margin-top: 14px">Chargement...</p>
    <p v-else-if="state === 'error'" style="margin-top: 14px; color: red">
      {{ error }}
    </p>

    <section v-else style="margin-top: 14px">
      <section
        style="display: flex; gap: 12px; flex-wrap: wrap; margin: 12px 0"
      >
        <div
          style="
            border: 1px solid #ddd;
            padding: 12px;
            border-radius: 12px;
            min-width: 220px;
          "
        >
          <strong>Ressources</strong>
          <p style="margin: 10px 0 0 0; font-size: 26px">
            {{ stats?.resources ?? "-" }}
          </p>
        </div>

        <div
          style="
            border: 1px solid #ddd;
            padding: 12px;
            border-radius: 12px;
            min-width: 220px;
          "
        >
          <strong>Actives</strong>
          <p style="margin: 10px 0 0 0; font-size: 26px">
            {{ stats?.reservationsActive ?? "-" }}
          </p>
        </div>

        <div
          style="
            border: 1px solid #ddd;
            padding: 12px;
            border-radius: 12px;
            min-width: 220px;
          "
        >
          <strong>Pending</strong>
          <p style="margin: 10px 0 0 0; font-size: 26px">
            {{ stats?.reservationsPending ?? "-" }}
          </p>
        </div>

        <div
          style="
            border: 1px solid #ddd;
            padding: 12px;
            border-radius: 12px;
            min-width: 220px;
          "
        >
          <strong>Annulées</strong>
          <p style="margin: 10px 0 0 0; font-size: 26px">
            {{ stats?.reservationsCancelled ?? "-" }}
          </p>
        </div>
      </section>

      <!-- FILTRES communs -->
      <section
        style="
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 12px;
          margin: 12px 0;
        "
      >
        <strong>Filtres</strong>

        <div
          style="
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 10px;
            align-items: center;
          "
        >
          <label style="display: flex; gap: 8px; align-items: center">
            <span>Status</span>
            <select
              v-model="filters.status"
              style="padding: 8px; border: 1px solid #ddd; border-radius: 8px"
            >
              <option value="">Tous</option>
              <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="MODIFIED">MODIFIED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </label>

          <label style="display: flex; gap: 8px; align-items: center">
            <span>Email</span>
            <input
              v-model="filters.email"
              placeholder="ex: demo@"
              style="padding: 8px; border: 1px solid #ddd; border-radius: 8px"
            />
          </label>

          <label style="display: flex; gap: 8px; align-items: center">
            <span>Salle</span>
            <select
              v-model="filters.resourceId"
              style="
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 8px;
                min-width: 220px;
              "
            >
              <option value="">Toutes</option>
              <option v-for="r in resources" :key="r.id" :value="r.id">
                {{ r.name }}
              </option>
            </select>
          </label>

          <button @click="reloadReservations">Appliquer</button>
        </div>
      </section>

      <!-- OVERVIEW -->
      <section v-if="tab === 'overview'">
        <h2>Réservations (global)</h2>

        <p v-if="reservationsState === 'loading'">Chargement...</p>
        <p v-else-if="reservationsState === 'error'" style="color: red">
          {{ reservationsError }}
        </p>

        <table
          v-else
          border="1"
          cellpadding="8"
          style="border-collapse: collapse; width: 100%"
        >
          <thead>
            <tr>
              <th>Salle</th>
              <th>User</th>
              <th>Début</th>
              <th>Fin</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in reservations" :key="r.id">
              <td>{{ r.resource?.name }}</td>
              <td>{{ r.user?.email }}</td>
              <td>{{ fmt(r.startAt) }}</td>
              <td>{{ fmt(r.endAt) }}</td>
              <td>{{ r.status }}</td>
              <td>
                <button
                  v-if="r.status !== 'CANCELLED'"
                  @click="adminCancel(r.id)"
                  :disabled="actionState === 'loading'"
                >
                  Annuler
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- BY USER -->
      <section v-else-if="tab === 'users'">
        <h2>Réservations par utilisateur</h2>

        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin: 10px 0">
          <input
            v-model="userSearch"
            placeholder="Recherche user (email/nom)"
            style="
              padding: 8px;
              border: 1px solid #ddd;
              border-radius: 8px;
              min-width: 280px;
            "
          />
          <button @click="reloadUsers">Rechercher</button>
        </div>

        <div
          style="
            display: grid;
            grid-template-columns: 1fr 1.2fr;
            gap: 12px;
            align-items: start;
          "
        >
          <!-- List users -->
          <section
            style="border: 1px solid #ddd; border-radius: 12px; padding: 12px"
          >
            <strong>Utilisateurs</strong>
            <p v-if="usersState === 'loading'">Chargement...</p>
            <p v-else-if="usersState === 'error'" style="color: red">
              {{ usersError }}
            </p>

            <ul
              v-else
              style="
                list-style: none;
                padding: 0;
                margin: 10px 0;
                display: grid;
                gap: 8px;
              "
            >
              <li v-for="u in users" :key="u.id">
                <button
                  @click="selectUser(u)"
                  :style="pickStyle(selectedUser?.id === u.id)"
                >
                  {{ u.email }} <span style="opacity: 0.6">({{ u.role }})</span>
                </button>
              </li>
            </ul>
          </section>

          <!-- User reservations -->
          <section
            style="border: 1px solid #ddd; border-radius: 12px; padding: 12px"
          >
            <strong>Détails</strong>
            <p v-if="!selectedUser" style="opacity: 0.7; margin-top: 10px">
              Sélectionne un utilisateur à gauche.
            </p>

            <div v-else style="margin-top: 10px">
              <p style="margin: 0">
                <strong>{{ selectedUser.email }}</strong>
              </p>
              <p style="margin: 6px 0; opacity: 0.7">
                Réservations trouvées : {{ userReservations.length }}
              </p>

              <table
                border="1"
                cellpadding="8"
                style="border-collapse: collapse; width: 100%"
              >
                <thead>
                  <tr>
                    <th>Salle</th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in userReservations" :key="r.id">
                    <td>{{ r.resource?.name }}</td>
                    <td>{{ fmt(r.startAt) }}</td>
                    <td>{{ fmt(r.endAt) }}</td>
                    <td>{{ r.status }}</td>
                    <td>
                      <button
                        v-if="r.status !== 'CANCELLED'"
                        @click="adminCancel(r.id)"
                        :disabled="actionState === 'loading'"
                      >
                        Annuler
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>

      <!-- BY ROOM -->
      <section v-else>
        <h2>Réservations par salle</h2>

        <div
          style="
            display: grid;
            grid-template-columns: 1fr 1.2fr;
            gap: 12px;
            align-items: start;
          "
        >
          <!-- List rooms -->
          <section
            style="border: 1px solid #ddd; border-radius: 12px; padding: 12px"
          >
            <strong>Salles</strong>

            <ul
              style="
                list-style: none;
                padding: 0;
                margin: 10px 0;
                display: grid;
                gap: 8px;
              "
            >
              <li v-for="r in resources" :key="r.id">
                <button
                  @click="selectRoom(r)"
                  :style="pickStyle(selectedRoom?.id === r.id)"
                >
                  {{ r.name }}
                  <span style="opacity: 0.6">{{
                    r.enabled ? "✅" : "❌"
                  }}</span>
                </button>
              </li>
            </ul>
          </section>

          <!-- Room reservations -->
          <section
            style="border: 1px solid #ddd; border-radius: 12px; padding: 12px"
          >
            <strong>Détails</strong>
            <p v-if="!selectedRoom" style="opacity: 0.7; margin-top: 10px">
              Sélectionne une salle à gauche.
            </p>

            <div v-else style="margin-top: 10px">
              <p style="margin: 0">
                <strong>{{ selectedRoom.name }}</strong>
              </p>
              <p style="margin: 6px 0; opacity: 0.7">
                Réservations trouvées : {{ roomReservations.length }}
              </p>

              <table
                border="1"
                cellpadding="8"
                style="border-collapse: collapse; width: 100%"
              >
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in roomReservations" :key="r.id">
                    <td>{{ r.user?.email }}</td>
                    <td>{{ fmt(r.startAt) }}</td>
                    <td>{{ fmt(r.endAt) }}</td>
                    <td>{{ r.status }}</td>
                    <td>
                      <button
                        v-if="r.status !== 'CANCELLED'"
                        @click="adminCancel(r.id)"
                        :disabled="actionState === 'loading'"
                      >
                        Annuler
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>

      <p v-if="actionState === 'error'" style="color: red; margin-top: 12px">
        {{ actionError }}
      </p>
      <p
        v-if="actionState === 'success'"
        style="color: green; margin-top: 12px"
      >
        Action effectuée ✅
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useAuth } from "@clerk/vue";
import {
  adminStats,
  adminReservations,
  adminUsers,
  adminResources,
  adminCancelReservation,
} from "../../../api/admin.api";

const tab = ref<"overview" | "users" | "rooms">("overview");

const state = ref<"loading" | "error" | "success">("loading");
const error = ref("");

const stats = ref<any>(null);
const reservations = ref<any[]>([]);
const resources = ref<any[]>([]);
const users = ref<any[]>([]);

const reservationsState = ref<"idle" | "loading" | "error" | "success">("idle");
const reservationsError = ref("");

const usersState = ref<"idle" | "loading" | "error" | "success">("idle");
const usersError = ref("");

const actionState = ref<"idle" | "loading" | "error" | "success">("idle");
const actionError = ref("");

const userSearch = ref("");
const selectedUser = ref<any>(null);
const selectedRoom = ref<any>(null);

const filters = ref({
  status: "",
  email: "",
  resourceId: "",
});

const { isLoaded, isSignedIn, getToken } = useAuth();

async function waitClerkLoaded() {
  while (!isLoaded.value) await new Promise((r) => setTimeout(r, 25));
  if (!isSignedIn.value) throw new Error("Non authentifié");
}

async function tokenOrThrow() {
  await waitClerkLoaded();
  const token = await getToken.value?.();
  if (!token) throw new Error("Token manquant");
  return token;
}

function tabStyle(name: string) {
  const active = tab.value === name;
  return `
    padding:8px 10px;border-radius:10px;border:1px solid ${active ? "#333" : "#ddd"};
    background:${active ? "#333" : "white"};color:${active ? "white" : "black"};cursor:pointer
  `;
}
function pickStyle(active: boolean) {
  return `
    width:100%;text-align:left;padding:10px;border-radius:10px;border:1px solid ${active ? "#333" : "#ddd"};
    background:${active ? "#333" : "white"};color:${active ? "white" : "black"};cursor:pointer
  `;
}

function fmt(v: string) {
  return new Date(v).toLocaleString();
}

function buildReservationsQS(extra?: Record<string, string>) {
  const p = new URLSearchParams();
  if (filters.value.status) p.set("status", filters.value.status);
  if (filters.value.email) p.set("email", filters.value.email);
  if (filters.value.resourceId) p.set("resourceId", filters.value.resourceId);
  if (extra) Object.entries(extra).forEach(([k, val]) => val && p.set(k, val));
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function reloadReservations() {
  reservationsState.value = "loading";
  reservationsError.value = "";
  try {
    const token = await tokenOrThrow();
    const res = await adminReservations(token, buildReservationsQS());
    reservations.value = res.data;
    reservationsState.value = "success";
  } catch (e: any) {
    reservationsState.value = "error";
    reservationsError.value = e?.message || "Erreur reservations";
  }
}

async function reloadUsers() {
  usersState.value = "loading";
  usersError.value = "";
  try {
    const token = await tokenOrThrow();
    const res = await adminUsers(token, userSearch.value.trim());
    users.value = res.data;
    usersState.value = "success";
  } catch (e: any) {
    usersState.value = "error";
    usersError.value = e?.message || "Erreur users";
  }
}

function selectUser(u: any) {
  selectedUser.value = u;
  selectedRoom.value = null;
}
function selectRoom(r: any) {
  selectedRoom.value = r;
  selectedUser.value = null;
}

const userReservations = computed(() => {
  if (!selectedUser.value) return [];
  return reservations.value.filter((r) => r.user?.id === selectedUser.value.id);
});

const roomReservations = computed(() => {
  if (!selectedRoom.value) return [];
  return reservations.value.filter(
    (r) => r.resource?.id === selectedRoom.value.id,
  );
});

async function adminCancel(id: string) {
  try {
    actionState.value = "loading";
    actionError.value = "";
    const token = await tokenOrThrow();
    await adminCancelReservation(token, id);

    // refresh
    await reloadReservations();

    actionState.value = "success";
    setTimeout(() => (actionState.value = "idle"), 900);
  } catch (e: any) {
    actionState.value = "error";
    actionError.value = e?.message || "Erreur action";
  }
}

onMounted(async () => {
  try {
    state.value = "loading";
    error.value = "";

    const token = await tokenOrThrow();

    const [s, rr, resRooms, resUsers] = await Promise.all([
      adminStats(token),
      adminReservations(token, ""),
      adminResources(token),
      adminUsers(token, ""),
    ]);

    stats.value = s.data;
    reservations.value = rr.data;
    resources.value = resRooms.data;
    users.value = resUsers.data;

    reservationsState.value = "success";
    usersState.value = "success";
    state.value = "success";
  } catch (e: any) {
    state.value = "error";
    error.value = e?.message || "Erreur";
  }
});
</script>
