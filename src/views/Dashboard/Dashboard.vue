<template>
  <div class="flex items-center justify-between">
    <h1 class="text-3xl block font-bold text-primary">Tableau de bord</h1>
    <div>
      <n-button type="primary" @click="prepareDocument">Préparer un nouveau document</n-button>
    </div>
  </div>

  <div class="flex items-center space-x-2 mt-4">
    <n-card class="shadow-sm">
      <n-statistic label="Documents signés">
        <template #prefix> </template>
        <template #suffix>{{ stats.docsSigned }}</template>
      </n-statistic>
    </n-card>
    <n-card class="shadow-sm">
      <n-statistic label="Documents en attente">
        <template #prefix> </template>
        <template #suffix> {{ stats.docsToSign }}</template>
      </n-statistic>
    </n-card>
    <n-card class="shadow-sm">
      <n-statistic label="Documents envoyés">
        <template #prefix> </template>
        <template #suffix>{{ stats.docsSent }}</template>
      </n-statistic>
    </n-card>
    <n-card class="shadow-sm">
      <n-statistic label="Contacts">
        <template #prefix> </template>
        <template #suffix> {{ stats.contact }}</template>
      </n-statistic>
    </n-card>
  </div>

  <div class="mt-8">
    <docs-to-sign @doc:sign-requested="onSignRequested" />
  </div>

  <div class="mt-8">
    <signed-docs @doc:view-requested="onViewRequested" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

import { useDocumentStore } from '@/stores/document'

import DocsToSign from './components/DocsToSign.vue'
import SignedDocs from './components/SignedDocs.vue'
import { NButton, NSpace, NStatistic, NIcon, NCard } from 'naive-ui'
import { List } from '@vicons/carbon'

export default defineComponent({
  name: 'Dashboard',

  components: {
    NButton,
    DocsToSign,
    SignedDocs,
    NSpace,
    NStatistic,
    NIcon,
    NCard,
    List,
  },

  setup() {
    const stats = computed(() => documentStore.stats)

    const router = useRouter()
    const documentStore = useDocumentStore()

    const prepareDocument = () => {
      router.push({ name: 'assign' })
    }

    const onSignRequested = (doc: any) => {
      documentStore.setDocToSign(doc)
      router.push({ name: 'sign_document' })
    }

    const onViewRequested = (doc: any) => {
      documentStore.setDocToView(doc)
      router.push({ name: 'view_document' })
    }

    onMounted(() => {
      documentStore.resetDocToView()
      documentStore.resetDocToSign()
      documentStore.getStats()
    })

    return {
      stats,
      prepareDocument,
      onSignRequested,
      onViewRequested,
    }
  },
  watch: {
    stats :()=>{
      const documentStore = useDocumentStore()
      return documentStore.getStats()
    },
  },
})
</script>
