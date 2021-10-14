<template>
  <h2 class="text-2xl  font-medium ">Documents en attente de signature</h2>
  <div class="mt-4 bg-white">
    <n-data-table :columns="columns" :data="data" :loading="loading"  />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, h, onMounted } from 'vue'

import { NDataTable, NButton } from 'naive-ui'
import { useDocumentStore } from '@/stores/document'

export default defineComponent({
  name: 'DocsToSign',

  components: {
    NDataTable,
    NButton,
  },

  emits: ['doc:sign-requested'],

  setup(_, { emit }) {
    const documentStore = useDocumentStore()

    const isLoading = computed(() => documentStore.fetchingDocsToSign)
    const data = computed(() => {
      return documentStore.docsToSign.map((doc) => {
        const sentAt = doc.requestedTime
          ? new Date(doc.requestedTime.seconds * 1000).toDateString()
          : ''

        return { sent_by: doc.email, sent_at: sentAt, docId: doc.docId, docRef: doc.docRef }
      })
    })

    const createColumns = () => {
      return [
        {
          title: 'Expéditeur',
          key: 'sent_by',
        },
        {
          title: 'Date de reception',
          key: 'sent_at',
        },
        {
          title: 'Action',
          key: 'actions',
          render(doc: any) {
            return h(
              NButton,
              {
                size: 'small',
                onClick: () => {
                  const { docRef, docId } = doc
                  emit('doc:sign-requested', { docRef, docId })
                },
              },
              { default: () => 'Signer le document' }
            )
          },
        },
      ]
    }

    onMounted(() => {
      documentStore.getDocsToSign()
    })

    return { data, columns: createColumns(), loading: isLoading }
  },
})
</script>
