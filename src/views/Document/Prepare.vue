<template>
  <div>
    <h2 class="text-2xl mb-8">Nouveau document</h2>

    <n-card>
      <div class="flex">
        <div class="w-3/12 flex flex-col space-y-4 px-2">
          <div class="flex flex-col space-y-2">
            <span class="text-base font-bold uppercase">Etape 1</span>
            <n-upload :on-update:file-list="onFileChange" :default-upload="false" ref="upload">
              <n-button>Ajouter un document</n-button>
            </n-upload>
          </div>
          <div class="flex flex-col space-y-2">
            <span class="text-base font-bold uppercase">Etape 2</span>
            <div>
              <span class="block">Signataire</span>
              <n-select v-model:value="signee" :options="signeesOptions" />
            </div>
            <div
              draggable="true"
              @dragstart="(e) => dragStart(e)"
              @dragend="(e) => dragEnd(e, 'SIGNATURE')"
            >
              <n-button type="success" ghost @click="handler.addFormField('SIGNATURE', signee)">
                Ajouter la zone de signature
                <template #icon>
                  <n-icon>
                    <brush />
                  </n-icon>
                </template>
              </n-button>
            </div>
            <div
              draggable="true"
              @dragstart="(e) => dragStart(e)"
              @dragend="(e) => dragEnd(e, 'TEXT')"
            >
              <n-button type="success" ghost @click="handler.addFormField('TEXT', signee)">
                Ajouter un zone de texte
                <template #icon>
                  <n-icon>
                    <brush />
                  </n-icon>
                </template>
              </n-button>
            </div>
            <div
              draggable="true"
              @dragstart="(e) => dragStart(e)"
              @dragend="(e) => dragEnd(e, 'DATE')"
            >
              <n-button type="success" ghost @click="handler.addFormField('DATE', signee)">
                Ajouter une date
                <template #icon>
                  <n-icon>
                    <brush />
                  </n-icon>
                </template>
              </n-button>
            </div>
          </div>
          <div class="flex flex-col space-y-2">
            <span class="text-base font-bold uppercase">Etape 3</span>
            <n-button type="primary" icon-placement="right" @click="handler.saveAndSend">
              Envoyer le document
              <template #icon>
                <n-icon>
                  <send />
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
import { storage, addDocumentToSign } from '@/firebase/firebase'
import { useUserStore } from '@/stores/user'
import { useSignatureStore } from '@/stores/signature'
import { applyFields, addField } from '@/utils/webviewer-form'
import WebViewer, { WebViewerInstance } from '@pdftron/webviewer'
import { NButton, NFormItem, NForm, NTable, NCard, NInput, NIcon, NUpload, NSelect } from 'naive-ui'
import { Brush, Send } from '@vicons/carbon'
export default defineComponent({
  name: 'PrepareDocument',
  components: {
    NButton,
    NFormItem,
    NForm,
    NTable,
    NCard,
    NInput,
    NIcon,
    NUpload,
    NSelect,
    Brush,
    Send,
  },
  setup() {
    const instance = ref<WebViewerInstance>(null)
    const signee = ref<string>('')
    const dropPoint = ref(null)
    const viewer = ref(null)
    const upload = ref(null)
    const handler = ref({
      saveAndSend: () => Promise.resolve(),
      addFormField: (
        type: string,
        name: string = '',
        value: string = '',
        flag = {},
        point = { x: null }
      ) => {},
    })
    const router = useRouter()
    const userStore = useUserStore()
    const signStore = useSignatureStore()
    const user = userStore.user
    const signeesOptions = signStore.signees.map((user) => ({
      value: user.email,
      label: user.name,
    }))
    signee.value = signeesOptions.length > 0 ? signeesOptions[0].value : ''
    const uploadForSigning = async (xfdfString: string) => {
      const { documentViewer } = instance.value.Core
      const document = documentViewer.getDocument()
      const storageRef = storage.ref()
      const referenceString = `docToSign/${user?.uid}${Date.now()}.pdf`
      const docRef = storageRef.child(referenceString)
      const data = await document.getFileData({ xfdfString })
      const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' })
      docRef.put(blob).then(() => {
        console.log('Uploaded')
      })
      // create an entry in the database
      const emails = signStore.signees.map((signee) => signee.email)
      await addDocumentToSign(user?.uid, user?.email, referenceString, emails)
      signStore.resetSignees()
      router.push('/')
    }
    const dragOver = (e) => {
      e.preventDefault()
      return false
    }
    const drop = (e, instance: WebViewerInstance) => {
      e.preventDefault()
      const { documentViewer } = instance.Core
      const scrollElement = documentViewer.getScrollViewElement()
      const scrollLeft = scrollElement.scrollLeft || 0
      const scrollTop = scrollElement.scrollTop || 0
      dropPoint.value = { x: e.pageX + scrollLeft, y: e.pageY + scrollTop }
      return false
    }
    const dragStart = (e) => {
      e.target.style.opacity = 0.5
      const copy = e.target.cloneNode(true)
      copy.id = 'form-build-drag-image-copy'
      copy.style.width = '250px'
      document.body.appendChild(copy)
      e.dataTransfer.setDragImage(copy, 125, 25)
      e.dataTransfer.setData('text', '')
    }
    const dragEnd = (e, type: string) => {
      handler.value.addFormField(type, '', '', {}, dropPoint.value)
      e.target.style.opacity = 1
      document.body.removeChild(document.getElementById('form-build-drag-image-copy'))
      e.preventDefault()
    }
    const onFileChange = (files: any[]) => {
      const fileObj = files.slice().shift()
      if (fileObj && fileObj.file) {
        instance.value.Core.documentViewer.loadDocument(fileObj.file)
      }
    }
    onMounted(() => {
      WebViewer({ path: 'webviewer' }, viewer?.value).then((viewerInstance) => {
        const { UI } = viewerInstance
        UI.setLanguage('fr')
        UI.disableElements(['ribbons', 'toggleNotesButton', 'searchButton', 'menuButton'])
        UI.setToolbarGroup('toolbarGroup-View', true)
        instance.value = viewerInstance
        handler.value.saveAndSend = applyFields(instance.value, uploadForSigning)
        handler.value.addFormField = addField(instance.value)
        const iframeDocument = UI.iframeWindow.document.body
        iframeDocument.addEventListener('dragover', dragOver)
        iframeDocument.addEventListener('drop', (e) => drop(e, viewerInstance))
      })
    })
    return {
      signee,
      viewer,
      upload,
      handler,
      signeesOptions,
      dragStart,
      dragEnd,
      onFileChange,
    }
  },
})
</script>