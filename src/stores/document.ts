// @ts-check
import { defineStore } from 'pinia'
import { useUserStore } from './user'

import {
  searchForDocumentToSign,
  searchForDocumentsSigned,
  searchDocumentSent,
  searchContacts,
} from '@/firebase/firebase'

export interface Document {
  docRef: string
  docId: string
}

export interface SignedDocument extends Document {
  signedTime: Date
  emails: string[]
}

export interface DocumentToSign extends Document {
  email: string
  requestedTime: Date
}

interface Stats {
  docsSigned?: number
  docsToSign?: number
  docsSent?: number,
  contact?:number
}

interface State {
  docsToSign: DocumentToSign[]
  signedDocs: SignedDocument[]
  docToView: SignedDocument | null
  docToSign: DocumentToSign | null
  fetchingSignedDocs: boolean
  fetchingDocsToSign: boolean
  stats: Stats
}

export const useDocumentStore = defineStore({
  id: 'document',

  state: (): State => ({
    docsToSign: [],
    signedDocs: [],
    docToSign: null,
    docToView: null,
    fetchingSignedDocs: false,
    fetchingDocsToSign: false,
    stats: {},
  }),

  actions: {
    async getDocsToSign() {
      try {
        this.fetchingDocsToSign = true
        const userStore = useUserStore()
        this.docsToSign = await searchForDocumentToSign(userStore.user?.email)
      } catch (error) {
        window.$message.error('Une erreur est survenue dans le chargement des documents à signer')
      } finally {
        this.fetchingDocsToSign = false
      }
    },

    async getSignedDocs() {
      try {
        this.fetchingSignedDocs = true
        const userStore = useUserStore()
        this.signedDocs = await searchForDocumentsSigned(userStore.user?.email)
      } catch (error) {
        window.$message.error('Une erreur est survenue dans le chargement des documents signées')
      } finally {
        this.fetchingSignedDocs = false
      }
    },

    setDocToView(doc: SignedDocument) {
      this.docToView = doc
    },

    resetDocToView() {
      this.docToView = null
    },

    setDocToSign(doc: DocumentToSign) {
      this.docToSign = doc
    },

    resetDocToSign() {
      this.docToSign = null
    },

    getStats() {
      // Requetes pour compter les documents

      const userStore = useUserStore()

      searchForDocumentsSigned(userStore.user?.email).then((documents) => {
        this.stats.docsSigned = documents.length
      })

      searchForDocumentToSign(userStore.user?.email).then((documents) => {
        this.stats.docsToSign = documents.length
      })

      searchDocumentSent(userStore.user?.email).then((documents) => {
        this.stats.docsSent = documents.length
      })

      searchContacts(userStore.user?.email).then((documents) => {
        this.stats.contact = documents.length
      })
    },
  },
})
