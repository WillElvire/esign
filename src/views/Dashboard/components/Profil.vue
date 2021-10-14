<template>
  <h1 class="font-bold text-3xl mt-7 text-primary"> Profil de {{ user.displayName }}</h1>
  <n-card class="mt-8">
    <h1 class="font-medium text-xl">Email : {{ user.email }}</h1>
    <h1 class="font-medium text-xl">Nom : {{ user.displayName }}</h1>
    <n-image width="100" :src="user.photoUrl" />
  </n-card>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { NCard, NImage } from 'naive-ui'
import { useUserStore } from '@/stores/user'
export default defineComponent({
  name: 'Profil',
  components: {
    NCard,
    NImage,
  },
  setup() {
    const user = useUserStore().user
    return {
      user,
    }
  },
})
</script>
