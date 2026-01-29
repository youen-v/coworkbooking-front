<template>
  <main style="max-width:700px;margin:0 auto;padding:16px">
    <h1>Modification enregistrée</h1>

    <p style="color:green">
      Modifications enregistrées ! Un email de confirmation a été envoyé.
    </p>

    <p>Vous allez être redirigé automatiquement vers vos réservations dans <span id="countdown">30</span> secondes.</p> 

    <RouterLink to="/reservations">Voir mes réservations</RouterLink>
  </main>
</template>
<script setup lang="ts">
    // mettre un minuteur de 30s avant redirection auto 
import { onMounted } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
onMounted(() => {
  setTimeout(() => {
    router.push("/reservations");
  }, 30000); // 30 secondes
});
// compteur dynamique
let countdown = 30;
onMounted(() => {
    const countdownElement = document.getElementById("countdown");
    const interval = setInterval(() => {
        countdown--;
        if (countdownElement) {
            countdownElement.textContent = countdown.toString();
        }
        if (countdown <= 0) {
            clearInterval(interval);
        }
    }, 1000); // Met à jour toutes les secondes
});
</script>