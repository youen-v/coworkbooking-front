<template>
  <main style="max-width:500px;margin:0 auto;padding:16px">
    <h1>Connexion</h1>

    <SignIn :fallbackRedirectUrl="redirectTo" :signUpForceRedirectUrl="`/register?redirectTo=${encodeURIComponent(redirectTo)}`"
 />
  </main>
</template>

<script setup lang="ts">
import { SignIn } from "@clerk/vue";
import { useRoute } from "vue-router";

const route = useRoute();
const redirectTo = (route.query.redirectTo as string) || "/rooms";
</script>
