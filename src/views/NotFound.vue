<template>
  <div class="flex flex-row min-h-full w-full pt-32 justify-center items-center">
    <h1 class="text-9xl font-extrabold pr-8 border-r-2 border-purple-700 text-purple-700">404</h1>
    <p class="p-4 text-2xl text-gray-500">Vous semblez perdu !</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NotFound',
})
</script>
