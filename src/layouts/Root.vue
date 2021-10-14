<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useMessage, useNotification } from 'naive-ui'

export default defineComponent({
  name: 'Root',

  setup() {
    onMounted(() => {
      window.$message = useMessage()
      window.$notification = useNotification()
    })
  },
})
</script>
