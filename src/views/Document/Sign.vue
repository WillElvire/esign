<template>
  <div>
    <h2 class="text-2xl mb-8">Signature d'un document</h2>

    <n-card>
      <div class="flex">
        <div class="w-3/12 flex flex-col space-y-4 px-2">
          <div class="flex flex-col space-y-2">
            <n-button icon-placement="right" @click="nextField">
              Champ suivant
              <template #icon>
                <n-icon>
                  <chevron-right />
                </n-icon>
              </template>
            </n-button>
          </div>
          <div class="flex flex-col space-y-2">
            <n-button @click="prevField">
              Champ précédent
              <template #icon>
                <n-icon>
                  <chevron-left />
                </n-icon>
              </template>
            </n-button>
          </div>
          <div class="flex flex-col space-y-2">
            <n-button type="primary" @click="completeSigning">
              Terminer la signature
              <template #icon>
                <n-icon>
                  <brush />
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
import { storage, documentsCollection } from '@/firebase/firebase'
import { useDocumentStore } from '@/stores/document'
import { useUserStore } from '@/stores/user'
import WebViewer, { WebViewerInstance } from '@pdftron/webviewer'
import { NButton, NIcon, NCard } from 'naive-ui'
import { ChevronLeft, ChevronRight, Brush } from '@vicons/carbon'
export default defineComponent({
  name: 'SignDocument',
  components: {
    ChevronLeft,
    ChevronRight,
    NButton,
    NIcon,
    NCard,
    Brush,
  },
  setup() {
    const annotationPos = ref(0)
    const instance = ref<WebViewerInstance>(null)
    const viewer = ref(null)
    const documentStore = useDocumentStore()
    const userStore = useUserStore()
    const router = useRouter()
    const docToSign = documentStore.docToSign
    const user = userStore.user
    const updateDocumentToSign = async (docId: string, email: string, xfdfSigned: string) => {
      console.log(xfdfSigned)
      const documentRef = documentsCollection.doc(docId)
      documentRef
        .get()
        .then(async (doc) => {
          if (doc.exists) {
            const { signedBy, emails, xfdf, docRef } = doc.data()
            if (!signedBy.includes(email)) {
              const signedByArray = [...signedBy, email]
              const xfdfArray = [...xfdf, xfdfSigned]
              await documentRef.update({
                xfdf: xfdfArray,
                signedBy: signedByArray,
              })
              if (signedByArray.length === emails.length) {
                const time = new Date()
                await documentRef.update({
                  signed: true,
                  signedTime: time,
                })
                mergeAnnotations(docRef, xfdfArray)
              }
            }
          } else {
            console.log('No such document!')
          }
        })
        .catch(function (error) {
          console.log('Error getting document:', error)
        })
    }
    async function mergeAnnotations(docRef: string, xfdf: any[]) {
      const { Core } = instance.value
      const storageRef = storage.ref()
      const URL = await storageRef.child(docRef).getDownloadURL()
      console.log('Download URL', URL)
      const main = async () => {
        const doc = await Core.PDFNet.PDFDoc.createFromURL(URL)
        doc.initSecurityHandler()
        for (let i = 0; i < xfdf.length; i++) {
          let fdfDoc = await Core.PDFNet.FDFDoc.createFromXFDF(xfdf[i])
          await doc.fdfMerge(fdfDoc)
          await doc.flattenAnnotations()
        }
        console.log('Doc', doc)
        const docbuf = await doc.saveMemoryBuffer(Core.PDFNet.SDFDoc.SaveOptions.e_linearized)
        console.log('Doc Buffer', docbuf)
        const blob = new Blob([docbuf], { type: 'application/pdf' })
        const documentRef = storageRef.child(docRef)
        documentRef.put(blob).then(function (snapshot) {
          console.log('Uploaded the doc')
        })
      }
      await Core.PDFNet.runWithCleanup(main, '')
    }
    onMounted(() => {
      WebViewer({ path: 'webviewer', fullAPI: true }, viewer.value).then(async (viewerInstance) => {
        const { Core, UI } = viewerInstance
        const { documentViewer, annotationManager, Annotations } = Core
        UI.setLanguage('fr')
        UI.setToolbarGroup('toolbarGroup-Insert', true)
        UI.disableElements([
          'ribbons',
          'toggleNotesButton',
          'searchButton',
          'menuButton',
          'rubberStampToolGroupButton',
          'stampToolGroupButton',
          'fileAttachmentToolGroupButton',
          'calloutToolGroupButton',
          'undo',
          'redo',
          'eraserToolButton',
        ])
        instance.value = viewerInstance
        // load document
        const storageRef = storage.ref()
        const URL = await storageRef.child(docToSign?.docRef).getDownloadURL()
        documentViewer.loadDocument(URL)
        const normalStyles = (widget) => {
          if (widget instanceof Annotations.TextWidgetAnnotation) {
            return { border: '1px solid #a5c7ff' }
          } else if (widget instanceof Annotations.SignatureWidgetAnnotation) {
            return { border: '1px solid #a5c7ff' }
          }
        }
        annotationManager.addEventListener(
          'annotationChanged',
          (annotations, action, { imported }) => {
            if (imported && action === 'add') {
              annotations.forEach(function (annotation: any) {
                if (annotation instanceof Annotations.WidgetAnnotation) {
                  Annotations.WidgetAnnotation.getCustomStyles = normalStyles
                  if (!annotation.fieldName.startsWith(user.email.replace('.', '_'))) {
                    annotation.Hidden = true
                    annotation.Listable = false
                  }
                }
              })
            }
          }
        )
      })
    })
    const nextField = () => {
      const { annotationManager } = instance.value.Core
      let annots = annotationManager.getAnnotationsList()
      if (annots[annotationPos.value]) {
        annotationManager.jumpToAnnotation(annots[annotationPos.value])
        if (annots[annotationPos.value + 1]) {
          annotationPos.value = annotationPos.value + 1
        }
      }
    }
    const prevField = () => {
      const { annotationManager } = instance.value.Core
      let annots = annotationManager.getAnnotationsList()
      if (annots[annotationPos.value]) {
        annotationManager.jumpToAnnotation(annots[annotationPos.value])
        if (annots[annotationPos.value - 1]) {
          annotationPos.value = annotationPos.value - 1
        }
      }
    }
    const completeSigning = async () => {
      const { annotationManager } = instance.value.Core
      const xfdf = await annotationManager.exportAnnotations({ widgets: false, links: false })
      await updateDocumentToSign(docToSign.docId, user.email, xfdf).then((document)=>{
         window.$message.success("Le document signé à bien été envoyé")
      })
      
      //router.push({ name: 'dashboard' })
    }
    return { viewer, nextField, prevField, completeSigning }
  },
})
</script>