// @ts-check
import { defineStore } from 'pinia'
interface Signee {
  key: string
  name: string
  email: string
}
interface State {
  signees: Signee[]
}

export const useSignatureStore = defineStore({
  id: 'signature',

  state: (): State => ({
    signees: [],
  }),

  actions: {
    addSignee(signee: Signee) {
      this.signees = [...this.signees, { key: signee.key, name: signee.name, email: signee.email }]
    },

    removeSignee(signee: Signee) {
      const signees = [...this.signees]
      signees.splice(this.signees.indexOf(signee), 1)
      this.signees = signees
    },

    resetSignees() {
      this.signees = []
    },
  },
})
