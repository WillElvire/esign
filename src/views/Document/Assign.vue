<template>
  <div>
    <h2 class="text-2xl mb-8">Renseigner un signataire</h2>

    <n-card>
      <n-button @click="showModal = true" type="primary" ghost>Ajouter un signataire</n-button>
      <n-button @click="showContact = true" type="primary" ghost class="ml-4"
        >Choisir un contact</n-button
      >
      <n-modal v-model:show="showModal">
        <n-card style="width: 600px" title="Ajouter un signataire" :bordered="false" size="huge">
          <n-form :label-width="80" :model="form" :rules="rules" ref="formRef">
            <n-form-item label="Nom" path="name">
              <n-input v-model:value="form.name" placeholder="Nom du signataire" />
            </n-form-item>
            <n-form-item label="Adresse E-mail" path="email">
              <n-input type="email" placeholder="Addresse mail" v-model:value="form.email" />
            </n-form-item>
            <n-form-item>
              <n-button @click="validateForm">Ajouter</n-button>
            </n-form-item>
          </n-form>
        </n-card>
      </n-modal>

      <n-modal v-model:show="showContact">
        <n-card style="width: 600px" title="Choisir un contact">
          <n-data-table
            :row-key="(row) => row.email"
            :columns="columns"
            :data="data"
            :pagination="pagination"
            @update:checked-row-keys="handleCheck"
          />

          <n-button class="bg-primary text-primary-content" @click="addSignees">Valider</n-button>
        </n-card>
      </n-modal>

      <n-table :bordered="false" :single-line="false" class="mt-10">
        <thead>
          <tr>
            <th>Nom du signataire</th>
            <th>Email du signataire</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="signee in signees" :key="signee.key">
            <td>{{ signee.name }}</td>
            <td>{{ signee.email }}</td>
            <td>
              <n-button @click="removeSignee(signee)">
                <n-icon color="red">
                  <trash />
                </n-icon>
              </n-button>
            </td>
          </tr>
        </tbody>
      </n-table>

      <n-button type="primary" class="mt-8" @click="prepare">Continuer</n-button>
    </n-card>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useSignatureStore } from '@/stores/signature'
import { validateEmail } from '@/utils/validators'

import {
  NButton,
  NFormItem,
  NForm,
  NTable,
  NCard,
  NInput,
  NIcon,
  NModal,
  NDataTable,
} from 'naive-ui'
import { Trash } from '@vicons/carbon'
import { useContactStore } from '@/stores/contact'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'Assign',

  components: {
    NButton,
    NFormItem,
    NForm,
    NTable,
    NCard,
    NInput,
    NIcon,
    Trash,
    NModal,
    NDataTable,
  },
  methods: {
    handleCheck(key: any) {
      this.checkedRowKeys = key
      console.log(key)
    },
  },
  data() {
    return {
      showModal: false,
      showContact: false,
      pagination: {
        pageSize: 4,
      },
      checkedRowKeys: [],
    }
  },

  setup() {
    const data = computed(() => {
      return contactStore.contacts.map((contact) => {
        return {
          email: contact.email,
          name: contact.name,
        }
      })
    })
    const createColumns = () => {
      return [
        {
          type: 'selection',
        },
        {
          title: 'name',
          key: 'name',
        },
        {
          title: 'Email',
          key: 'email',
        },
      ]
    }

    const contactStore = useContactStore()
    const signStore = useSignatureStore()
    const signees = computed(() => signStore.signees)
    const router = useRouter()
    const isLoading = contactStore.fetchingContacts
    const formRef = ref(null)
    const form = ref({
      email: null,
      name: null,
    })

    const rules = {
      email: [
        {
          required: true,
          message: 'Veuillez entrer une adresse E-mail',
          trigger: ['blur', 'input'],
        },
        {
          validator: validateEmail,
          message: 'Veuillez entrer une adresse E-mail valide',
          trigger: ['blur'],
        },
      ],
      name: {
        required: true,
        message: 'Veuillez entrer le nom du destinataire',
        trigger: ['blur', 'input'],
      },
    }

    const prepare = () => {
      if (signStore.signees.length > 0) {
        router.push({ name: 'prepare_document' })
      } else {
        window.$message.error('Vous devez renseigner au moins un signataire')
      }
    }

    const addSignee = () => {
      const key = `${new Date().getTime()}${form.value.email}`
      signStore.addSignee({ key, name: form.value.name, email: form.value.email })
      form.value = { email: null, name: null }
    }

    const removeSignee = (signee: any) => {
      signStore.removeSignee(signee)
    }

    const addSignees = () => {}

    const validateForm = (event: any) => {
      event.preventDefault()
      formRef.value.validate((errors: any) => {
        if (!errors) {
          addSignee()
        } else {
          window.$message.error('Invalid')
        }
      })
    }

    onMounted(() => {
      contactStore.getContacts()
    })

    return {
      form,
      rules,
      formRef,
      prepare,
      validateForm,
      signees,
      removeSignee,
      columns: createColumns(),
      data,
      loading: isLoading,
      addSignees,
    }
  },
})
</script>
