<template>
  <div id="auth-layout">
    <root />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Root from './Root.vue'

export default defineComponent({
  name: 'AuthLayout',

  components: {
    Root,
  },
})
</script>
