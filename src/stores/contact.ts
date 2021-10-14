import { defineStore } from 'pinia'
import { searchContacts, searchContact } from '@/firebase/firebase'
import { useUserStore } from '@/stores/user'
import * as fb from '@/firebase/firebase'

export interface Contacts {
  name?: string | null
  email?: string | null
}

export interface state {
  contacts: Contacts[]
  fetchingContacts: boolean
}

export const useContactStore = defineStore({
  id: 'contact',

  state: (): state => ({
    contacts: [],
    fetchingContacts: false,
  }),

  actions: {
    async getContacts() {
      try {
        this.fetchingContacts = true
        const userStore = useUserStore()
        this.contacts = await searchContacts(userStore.user?.email)
      } catch (error) {
        window.$message.error('Une erreur est survenue dans le chargement des documents signées')
      } finally {
        this.fetchingContacts = false
      }
    },
    async deleteContact(email: string) {
      await fb.deleteContact(email).catch((error) => {
        window.$message.error('Erreur durant la suppression')
      })
    },

    async addContact(name: string, email: string) {
      const userStore = useUserStore()
      const payload = {
        provider: userStore.user?.email,
        name,
        email,
      }

      await searchContact(email).then((contact) => {
        if (contact.length == 0) {
          fb.contactsCollection.add(payload).then(() => {
            window.$message.success(`Votre contact ${name} a été ajouté`)
          })
        } else {
          window.$message.error('Vous avez déja enregistré ce contact')
        }
      })
    },
  },
})
