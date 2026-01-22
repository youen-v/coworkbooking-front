<template>
  <main style="max-width:900px;margin:0 auto;padding:16px">
    <header style="display:flex;justify-content:space-between;align-items:center;gap:12px">
      <h1>Salles disponibles</h1>

      <RouterLink to="/login">Se connecter</RouterLink>
    </header>

    <p v-if="state === 'loading'">Chargement...</p>
    <p v-else-if="state === 'error'">Erreur : {{ error }}</p>
    <p v-else-if="rooms.length === 0">Aucune salle disponible</p>

    <ul v-else style="display:grid;gap:12px;list-style:none;padding:0">
      <li
        v-for="r in rooms"
        :key="r.id"
        style="border:1px solid #ddd;border-radius:12px;padding:12px"
      >
        <h2 style="margin:0">{{ r.name }}</h2>
        <p style="margin:6px 0;color:#555">{{ r.description }}</p>

        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <small v-if="r.capacity">Capacité : {{ r.capacity }}</small>
          <small>⏱ {{ r.durationMin }}–{{ r.durationMax }} min</small>
        </div>

        <div style="margin-top:10px">
          <RouterLink :to="`/rooms/${r.id}`">Voir les disponibilités</RouterLink>
        </div>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getPublicRooms } from "../../api/publicRooms.api";

const rooms = ref<any[]>([]);
const state = ref<"loading" | "error" | "success">("loading");
const error = ref("");

onMounted(async () => {
  try {
    const res = await getPublicRooms();
    rooms.value = res.data;
    state.value = "success";
  } catch (e: any) {
    state.value = "error";
    error.value = e?.message || "Erreur inconnue";
  }
});
</script>
