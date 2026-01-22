<template>
  <main style="max-width:900px;margin:0 auto;padding:16px">
    <p><RouterLink to="/rooms">⬅ Retour salles</RouterLink></p>

    <h1 v-if="state==='loading'">Chargement...</h1>
    <p v-else-if="state==='error'">Erreur: {{ error }}</p>

    <section v-else>
      <h1>{{ room.name }}</h1>
      <p>{{ room.description }}</p>

      <hr style="margin:16px 0" />

      <h3>Choisir une date</h3>
      <input type="date" v-model="date" @change="loadSlots" />

      <p v-if="slotsState==='loading'">Chargement des créneaux...</p>
      <p v-else-if="slotsState==='error'">Erreur slots: {{ slotsError }}</p>
      <p v-else-if="slots.length===0">Aucun créneau disponible</p>

      <div v-else style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button
          v-for="s in slots"
          :key="s.startAt"
          @click="goBook(s)"
        >
          {{ formatTime(s.startAt) }}
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getPublicRoom, getRoomSlots } from "../../api/publicRooms.api";

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

const room = ref<any>(null);
const state = ref<"loading"|"error"|"success">("loading");
const error = ref("");

const date = ref(new Date().toISOString().slice(0,10));

const slots = ref<{startAt:string; endAt:string}[]>([]);
const slotsState = ref<"idle"|"loading"|"error"|"success">("idle");
const slotsError = ref("");

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function loadSlots() {
  slotsState.value = "loading";
  slotsError.value = "";
  try {
    const res = await getRoomSlots(id, date.value, 60);
    slots.value = res.data;
    slotsState.value = "success";
  } catch (e:any) {
    slotsState.value = "error";
    slotsError.value = e?.message || "Erreur inconnue";
  }
}

function goBook(s: any) {
  router.push(`/rooms/${id}/book?startAt=${encodeURIComponent(s.startAt)}&endAt=${encodeURIComponent(s.endAt)}`);
}

onMounted(async () => {
  try {
    const res = await getPublicRoom(id);
    room.value = res.data;
    state.value = "success";
    await loadSlots();
  } catch (e:any) {
    state.value = "error";
    error.value = e?.message || "Erreur inconnue";
  }
});
</script>
