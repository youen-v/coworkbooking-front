<template>
  <main style="max-width:900px;margin:0 auto;padding:16px">
    <h1>Ressources</h1>

    <p v-if="state==='loading'">Chargement...</p>
    <p v-else-if="state==='error'">Erreur: {{ error }}</p>
    <p v-else-if="resources.length===0">Aucune ressource disponible</p>

    <ul v-else>
      <li v-for="r in resources" :key="r.id">
        <RouterLink :to="`/app/resources/${r.id}`">
          {{ r.name }} ({{ r.enabled ? "active" : "inactive" }})
        </RouterLink>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getResources } from "../../api/resources.api";

const resources = ref<any[]>([]);
const state = ref<"loading"|"error"|"success">("loading");
const error = ref("");

onMounted(async () => {
  try {
    const res = await getResources();
    resources.value = res.data;
    state.value = "success";
  } catch (e: any) {
    state.value = "error";
    error.value = e?.message || "Erreur inconnue";
  }
});
</script>
