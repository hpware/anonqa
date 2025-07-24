<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const slug = route.params.slug;
</script>
<template>
  <div>
    <div>{{ slug }}</div>
  </div>
</template>
