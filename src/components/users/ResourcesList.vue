<template>
  <main style="max-width:900px;margin:0 auto;padding:16px">
    <p>
      <RouterLink to="/app/resources">Retour</RouterLink>
    </p>

    <h1 v-if="state === 'loading'">Chargement...</h1>
    <p v-else-if="state === 'error'">Erreur: {{ error }}</p>

    <section v-else>
      <h1>{{ resource.name }}</h1>
      <p>{{ resource.description }}</p>

      <p>
        <strong>Durée min :</strong> {{ resource.durationMin }} min |
        <strong>Durée max :</strong> {{ resource.durationMax }} min
      </p>

      <p v-if="resource.capacity">
        <strong>Capacité :</strong> {{ resource.capacity }}
      </p>

      <div style="margin-top:16px">
        <RouterLink :to="`/app/resources/${resource.id}/book`">
          Réserver cette ressource
        </RouterLink>
      </div>

      <hr style="margin:24px 0" />

      <h3>Disponibilités (MVP)</h3>
      <pre style="background:#f5f5f5;padding:12px;border-radius:8px;overflow:auto">
{{ resource.availability }}
</pre>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getResource } from "../../api/resources.api";

const route = useRoute();

const resource = ref<any>(null);
const state = ref<"loading" | "error" | "success">("loading");
const error = ref("");

onMounted(async () => {
  try {
    const res = await getResource(route.params.id as string);
    resource.value = res.data;
    state.value = "success";
  } catch (e: any) {
    state.value = "error";
    error.value = e?.message || "Erreur inconnue";
  }
});
</script>
