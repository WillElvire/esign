<script lang="ts">
import { defineComponent } from 'vue'
import { NLayoutFooter } from 'naive-ui'

export default defineComponent({
  components: {
    NLayoutFooter,
  },
})
</script>

<template>
  <n-layout-footer position="absolute" style="height: 64px; padding: 24px" bordered>
    <div class="flex items-center justify-between">
      <div>© {{ new Date().getFullYear() }} fa-esign.com. Tous droits réservés.</div>
      <div class="flex items-center space-x-2 text-sm text-gray-600">
        <a href="#" class="block hover:text-primary-600">Termes et conditions</a>
        <a href="#" class="block hover:text-primary-600">Confidentialité</a>
      </div>
    </div>
  </n-layout-footer>
</template>
