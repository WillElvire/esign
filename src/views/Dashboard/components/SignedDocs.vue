<template>
  <h2 class="text-2xl font-medium">Document signés</h2>
  <div class="mt-4 bg-white">
    <n-data-table :columns="columns" :data="data" :loading="loading" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, h, onMounted } from 'vue'

import { NDataTable, NButton } from 'naive-ui'
import { useDocumentStore } from '@/stores/document'

export default defineComponent({
  name: 'SignedDocs',

  components: {
    NDataTable,
    NButton,
  },

  emits: ['doc:view-requested'],

  setup(_, { emit }) {
    const documentStore = useDocumentStore()
    const isLoading = computed(() => documentStore.fetchingSignedDocs)
    const data = computed(() => {
      return documentStore.signedDocs.map((doc, index) => {
        const sentAt = doc.signedTime ? new Date(doc.signedTime.seconds * 1000).toDateString() : ''

        return {
          key: index,
          sent_by: doc.emails.join(','),
          sent_at: sentAt,
          docId: doc.docId,
          docRef: doc.docRef,
        }
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
                  emit('doc:view-requested', { docRef, docId })
                },
              },
              { default: () => 'Consulter le document' }
            )
          },
        },
      ]
    }

    onMounted(() => {
      documentStore.getSignedDocs()
    })

    return { data, columns: createColumns(), loading: isLoading }
  },
})
</script>
