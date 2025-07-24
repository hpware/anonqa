<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const slug = route.params.slug;
</script>
<template>
  <div>
    <form class="justify-center m-auto flex flex-col w-full md:w-md">
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
        class="rounded rounded-t-none p-1 h-[150px] border border-t-0"
      />
      <button>Submit</button>
    </form>
  </div>
</template>
