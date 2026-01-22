<template>
  <main style="max-width:1000px;margin:0 auto;padding:16px">
    <h1>Admin</h1>

    <section style="display:flex;gap:12px;flex-wrap:wrap;margin:16px 0">
      <div style="border:1px solid #ddd;padding:12px;border-radius:10px;min-width:200px">
        <strong>Ressources</strong>
        <p>{{ stats?.resources ?? "-" }}</p>
      </div>
      <div style="border:1px solid #ddd;padding:12px;border-radius:10px;min-width:200px">
        <strong>Réservations actives</strong>
        <p>{{ stats?.reservationsActive ?? "-" }}</p>
      </div>
    </section>

    <h2>Réservations (global)</h2>

    <p v-if="state==='loading'">Chargement...</p>
    <p v-else-if="state==='error'">Erreur: {{ error }}</p>

    <table v-else border="1" cellpadding="8" style="border-collapse:collapse;width:100%">
      <thead>
        <tr>
          <th>Ressource</th>
          <th>User</th>
          <th>Start</th>
          <th>End</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in reservations" :key="r.id">
          <td>{{ r.resource.name }}</td>
          <td>{{ r.user.email }}</td>
          <td>{{ new Date(r.startAt).toLocaleString() }}</td>
          <td>{{ new Date(r.endAt).toLocaleString() }}</td>
          <td>{{ r.status }}</td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { authedFetch } from "../../../api/authedFetch";

const state = ref<"loading"|"error"|"success">("loading");
const error = ref("");

const reservations = ref<any[]>([]);
const stats = ref<any>(null);

onMounted(async () => {
  try {
    const [statsRes, resRes] = await Promise.all([
      authedFetch<{ data: any }>("/api/v1/admin/stats"),
      authedFetch<{ data: any[] }>("/api/v1/admin/reservations"),
    ]);

    stats.value = statsRes.data;
    reservations.value = resRes.data;
    state.value = "success";
  } catch (e: any) {
    state.value = "error";
    error.value = e?.message || "Erreur inconnue";
  }
});
</script>
