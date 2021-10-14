<template>
  <!-- component -->
  <header
    class="min-h-screen"
    style="
      background: url(/public/background.jpg);
      background-size: cover;
      background-repeat: no-repeat;
    "
  >
    <!-- Navigaiton Bar -->
    <nav class="flex items-center py-8 px-14 justify-between">
      <div class="flex items-center">
        <h1 class="text-2xl font-bold text-gray-700">
          <span class="text-2xl font-black leading-none text-primary select-none logo"
            >FA E-Sign<span class="text-white">.</span></span
          >
        </h1>
        <div class="ml-10">
          <ul class="md:flex space-x-8 hidden">
            <li>
              <a href="#" class="text-white font-semibold">
                <router-link to="/landing">Accueil</router-link>
              </a>
            </li>
            <li><a href="#" class="text-white font-semibold">Aide</a></li>
            <li>
              <a href="#" class="text-white font-semibold">
                <router-link to="/register"> Inscription </router-link>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div
        class="
          lg:flex
          hidden
          items-center
          space-x-3
          py-3
          px-6
          bg-primary
          text-white
          rounded-lg
          transition-all
          duration-400
          transform
          hover:scale-105
          cursor-pointer
          hover:shadow-lg
        "
      >
        <button>
          <router-link to="/">Se connecter</router-link>
        </button>
      </div>
    </nav>
    <!-- End Navigation Bar -->

    <!-- Section Hero -->
    <!-- Box left -->
    <div class="md:flex space-x-16 mt-20 md:mr-0 mr-10">
      <div class="md:flex items-center pl-16">
        <div>
          <h1 class="lg:text-5xl font-bold text-secondary leading-tight text-3xl">
            Signer vos documents  <br> en toute fiabilité
          </h1>
          <p class="mt-4 text-lg font-medium text-primary">
            Signer des documents n'a jamais été aussi facile
          </p>
          <div
            class="
              flex
              mt-10
              w-60
              items-center
              space-x-3
              py-3
              px-6
              bg-primary
              text-white
              rounded-lg
              transition-all
              duration-400
              transform
              hover:scale-105
              cursor-pointer
              hover:shadow-lg
            "
          >
            <button class="text-lg text-md">
              <router-link to="/">Signer un document</router-link>
            </button>
          </div>
        </div>
      </div>
     
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { NCard } from 'naive-ui'
import { Signature, Power } from '@vicons/carbon'
export default defineComponent({
  name: 'Landing',
  components: {
    NCard,
    Signature,
    Power,
  },
  setup() {
    return {}
  },
})
</script>
