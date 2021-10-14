<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-notification-provider>
      <n-message-provider>
        <n-dialog-provider>
          <div class="min-h-screen">
            <component :is="layout" />
          </div>
        </n-dialog-provider>
      </n-message-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { themeOverrides } from './config'
import { useUserStore } from '@/stores/user'

import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { NConfigProvider, NDialogProvider, NMessageProvider, NNotificationProvider } from 'naive-ui'

export default defineComponent({
  name: 'App',

  components: {
    NConfigProvider,
    NDialogProvider,
    NMessageProvider,
    NNotificationProvider,
    DefaultLayout,
    AuthLayout,
  },

  setup() {
    const route = useRoute()
    const userStore = useUserStore()

    const layout = ref(route.meta.layout || 'DefaultLayout')

    watch(
      () => route.matched,
      () => {
        if (route.meta.layout !== undefined) {
          layout.value = route.meta.layout
        } else {
          layout.value = 'DefaultLayout'
        }
      }
    )

    watch(
      () => userStore.$state,
      (state) => {
        // persist the whole state to the local storage whenever it changes
        localStorage.setItem('userState', JSON.stringify(state))
      },
      { deep: true }
    )

    return { themeOverrides, layout }
  },
})
</script>
