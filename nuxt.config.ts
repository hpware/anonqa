import tailwindcss from "@tailwindcss/vite";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["convex-nuxt"],
  convex: {
    url: process.env.NUXT_PUBLIC_CONVEX_URL || "",
  },
  css: ["~/style.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      convexUrl: process.env.CONVEX_URL,
    },
  },
});
