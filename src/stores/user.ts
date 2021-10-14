// @ts-check
import { defineStore } from 'pinia'
import * as fb from '@/firebase/firebase'
import { useSignatureStore } from './signature'
import 'firebase/auth'
import router from '@/router'


export interface User {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
}

interface State {
  user: User | null
}

const lastState = localStorage.getItem('userState')
  ? JSON.parse(localStorage.getItem('userState') || '')
  : null

export const useUserStore = defineStore({
  id: 'user',

  state: (): State => ({
    user: lastState && lastState.user,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
  },

  actions: {
    async login(email: string, password: string) {
      const data = await fb.auth
        .signInWithEmailAndPassword(email, password)
        .then((user) => {
          if (!user?.user?.email) {
            window.$message.error('Merci de verifier vos informations.')
            return
          } else {
            this.fetchUserProfile(user?.user?.uid)
          }
        })
        .catch((error) => {
          return window.$message.error('Merci de verifier vos informations.')
        })
    },

    async fetchUserProfile(userUid: string) {
      const userProfile = await fb.getUserDocument(userUid)

      // @ts-ignore
      this.user = { uid: userUid, ...userProfile }
    },

    async loginWithGoogle() {
      await fb
        .signInWithGoogle()
        .then((user: firebase.default.auth.UserCredential) => {
          if (!user?.user?.email) {
            window.$message.error('Merci de verifier vos informations.')
            return
          } else {
            this.fetchUserProfile(user?.user?.uid)
            router.push('/')
          }
        })
        .catch((error) => {
          window.$message.error('Une erreur erreur est surnevue')
          return
        })
    },

    async SignInWithGoogle() {
      await fb
        .signInWithGoogle()
        .then((user: firebase.default.auth.UserCredential) => {
          if (!user?.user?.email) {
            window.$message.error('Merci de verifier vos informations.')
            return
          } else {
            this.createProfile(
              user?.user?.uid,
              user?.user?.displayName,
              user?.user?.email,
              user?.user.photoURL
            ).then(() => {
              router.push('/dashboard')
            })
          }
        })
        .catch((error) => {
          window.$message.error('Une erreur erreur est surnevue')
          return
        })
    },

    async logout() {
      fb.auth.signOut()
      this.user = null
      useSignatureStore().resetSignees()
    },

    async register(name: string, email: string, password: string) {
      const data = await fb.auth.createUserWithEmailAndPassword(email, password)
      
      if (!data?.user) {
        window.$message.error('Merci de verifier vos informations.')
        return
      }

      await this.createProfile(data.user.uid, name, email)
    },

    async createProfile(userUid: string, name: any, email: string, photoUrl: any = '') {
      const payload = {
        displayName: name,
        email: email,
        photoUrl,
        uid: userUid,
      }
      await fb.usersCollection.add(payload)
      this.user = payload
    },
  },
})
