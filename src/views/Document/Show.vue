<template>
  <div>
    <h2 class="text-2xl mb-8">Consulter un document</h2>

    <n-card>
      <div class="flex">
        <div class="w-3/12 flex flex-col space-y-4 px-2">
          <div class="flex flex-col space-y-2">
            <n-button @click="download">
              Telecharger le document signé
              <template #icon>
                <n-icon>
                  <file-download />
                </n-icon>
              </template>
            </n-button>
          </div>
          <div class="flex flex-col space-y-2">
            <n-button type="primary" @click="doneViewing">
              J'ai terminé
              <template #icon>
                <n-icon>
                  <check />
                </n-icon>
              </template>
            </n-button>
          </div>
        </div>
        <div class="w-9/12">
          <div className="webviewer" style="height: 68vh" ref="viewer"></div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { storage } from '@/firebase/firebase'
import { useDocumentStore } from '@/stores/document'

import WebViewer, { WebViewerInstance } from '@pdftron/webviewer'
import { NButton, NIcon, NCard } from 'naive-ui'
import { FileDownload, Check } from '@vicons/carbon'

export default defineComponent({
  name: 'ViewDocument',

  components: {
    FileDownload,
    Check,
    NButton,
    NIcon,
    NCard,
  },

  setup() {
    const instance = ref<WebViewerInstance>(null)
    const viewer = ref(null)

    const documentStore = useDocumentStore()
    const router = useRouter()

    const docToView = documentStore.docToView

    onMounted(() => {
      WebViewer({ path: `${import.meta.env.VITE_BASE_URL}/webviewer` }, viewer.value).then(
        async (viewerInstance) => {
          const { Core, UI } = viewerInstance
          const { documentViewer } = Core

          UI.setLanguage('fr')
          UI.setToolbarGroup('toolbarGroup-View', true) // select only the insert group
          UI.disableElements(['ribbons', 'toggleNotesButton', 'contextMenuPopup'])

          instance.value = viewerInstance

          // load document
          const storageRef = storage.ref()
          const URL = await storageRef.child(docToView?.docRef).getDownloadURL()

          documentViewer.loadDocument(URL)
        }
      )
    })

    const download = () => {
      instance.value.downloadPdf()
    }

    const doneViewing = async () => {
      router.push({ name: 'dashboard' })
    }

    return { viewer, download, doneViewing }
  },
})
</script>
