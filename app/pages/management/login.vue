<script lang="ts" setup>
import { InstagramIcon } from "lucide-vue-next";
</script>

<template>
  <div class="absolute inset-0 flex flex-col justify-center">
    <div
      class="flex flex-col justify-center align-middle text-center px-12 py-8 m-auto backdrop-blur-lg border bg-gray-200/60 rounded"
    >
      <h2 class="text-2xl text-bold pb-4">登入</h2>
      <button
        class="p-2 bg-gradient-to-br from-blue-600 hover:from-blue-600/50 to-pink-300 hover:to-pink-300/50 rounded m-auto text-white border hover:cursor-pointer transition-all duration-300 flex flex-row justify-center"
      >
        <InstagramIcon class="p-1" />&nbsp;Instagram
      </button>
    </div>
  </div>
</template>
