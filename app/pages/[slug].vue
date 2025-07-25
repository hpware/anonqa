<script setup lang="ts">
"use server";
import { api } from "../convex/_generated/api";
const route = useRoute();
const router = useRouter();
const slug = route.params.slug;

useHead({
  title: `@${slug} || QA`,
});

//values
const textareavalue = ref("");
const submitted = ref(false);

const submitAction = async () => {
  console.log("Hi");
  console.log(textareavalue.value);
  submitted.value = true;
};

// Convex
const { data, error, suspense } = useConvexQuery(
    api.pages.users
  );
await suspense(); 
</script>
<template>
  <div>
    <div v-for="i in data">
      <span>{{ i }}</span>
    </div>
    <form
      class="justify-center m-auto flex flex-col w-full md:w-md"
      @submit.prevent="submitAction"
      v-if="!submitted"
    >
      <!--User bar-->
      <div
        class="flex flex-row pt-3 border border-b-0 mt-2 rounded-t-lg bg-gradient-to-br from-blue-600 to-pink-300 text-white"
      >
        <img
          alt="Profile Picture"
          src="https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D"
          class="w-12 h-12 rounded-full p-1"
        />
        <div class="flex flex-col">
          <span>SSSSSSSS</span>
          <span>@{{ slug }}</span>
        </div>
      </div>
      <textarea
        required
        class="rounded rounded-t-none p-1 pt-0 h-[150px] border border-t-0"
        v-model="textareavalue"
      />
      <button
        class="p-2 m-2 bg-black rounded-lg text-white hover:cursor-pointer hover:bg-black/50 transition-all duration-300"
      >
        Submit
      </button>
    </form>
    <div v-else>Submitted!</div>
  </div>
</template>
