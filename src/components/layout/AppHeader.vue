<template>
  <header
    style="max-width:900px;margin:0 auto;padding:16px;display:flex;justify-content:space-between;align-items:center;gap:12px"
  >
    <RouterLink to="/" style="text-decoration:none;font-weight:700">
      CoworkBooking
    </RouterLink>

    <!-- Chargement -->
    <div v-if="!isLoaded">Chargement...</div>

    <!-- Non connecté -->
    <div v-else-if="!isSignedIn" style="display:flex;gap:10px;align-items:center">
      <RouterLink to="/rooms">Salles</RouterLink>
      <RouterLink to="/login">Se connecter</RouterLink>
    </div>

    <!-- Connecté -->
    <div v-else style="display:flex;gap:10px;align-items:center">
      <RouterLink to="/rooms">Salles</RouterLink>
      <RouterLink to="/reservations">Mes réservations</RouterLink>

      <span style="opacity:0.8">
        👤 {{ displayName }}
      </span>

      <button @click="logout" style="cursor:pointer">
        Déconnexion
      </button>
    </div>
  </header>

  <hr style="border:none;border-top:1px solid #eee" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuth, useUser } from "@clerk/vue";

const router = useRouter();
const { isLoaded, isSignedIn, signOut } = useAuth();
const { user } = useUser();

const displayName = computed(() => {
  const name = [user.value?.firstName, user.value?.lastName].filter(Boolean).join(" ");
  if (name) return name;
  return user.value?.primaryEmailAddress?.emailAddress || "Utilisateur";
});

async function logout() {
  await signOut.value?.();
  router.push("/");
}
</script>
