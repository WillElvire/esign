<template>
  <router-link :to="link"><slot></slot></router-link>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NavLink',

  props: {
    link: { type: String, required: true },
  },

  setup(props) {
    return { link: props.link }
  },
})
</script>
