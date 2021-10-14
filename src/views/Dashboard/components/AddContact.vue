<template>
  <div>
    <h1 class="font-bold text-3xl mt-5 text-primary">Ajouter un contact</h1>
    <n-button type="primary" class="ml-1 mt-5" @click="showModal = true">
      <n-icon class="ml-3 text-xl"><user /></n-icon> Ajouter un contact
    </n-button>
    <n-card class="mt-4">
      <n-data-table
        :row-key="(row) => row.email"
        :columns="columns"
        :data="data"
        :pagination="pagination"
        :loading="loading"
      />
    </n-card>
    <n-modal v-model:show="showModal">
      <n-card style="width: 600px" title="Ajouter un contact" :bordered="false" size="huge">
        <n-form :label-width="80" :model="form" :rules="rules" ref="formRef">
          <n-form-item label="Nom" path="nom">
            <n-input
              v-model:value="form.nom"
              type="text"
              class="mt-2"
              placeholder="Nom du contact"
            />
          </n-form-item>
          <n-form-item label="email" path="email">
            <n-input v-model:value="form.email" type="email" placeholder="Numéro du contact" />
          </n-form-item>
          <n-form-item>
            <n-button @click="validateForm" type="primary">Ajouter un contact</n-button>
          </n-form-item>
        </n-form>
      </n-card>
    </n-modal>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, h, computed, onMounted } from 'vue'
import { NButton, NModal, NFormItem, NForm, NCard, NInput, NIcon, NDataTable } from 'naive-ui'
import { User } from '@vicons/carbon'
import { validateEmail } from '@/utils'
import { useContactStore } from '@/stores/contact'

export default defineComponent({
  name: 'AddContact',

  components: {
    NInput,
    NCard,
    NButton,
    NForm,
    NFormItem,
    NIcon,
    User,
    NModal,
    NDataTable,
  },

  data() {
    return {
      showModal: false,
      pagination: {
        pageSize: 4,
      },
    }
  },

  setup() {
    const isLoading = computed(() => contactStore.fetchContacts)

    const resetForm = () => {
      form.value.email = null
      form.value.nom = null
    }
    const contactStore = useContactStore()
    const data = computed(() => {
      return contactStore.contacts.map((contact) => {
        return { email: contact.email, name: contact.name }
      })
    })
    const deleteContact = (row: any) => {
      contactStore.deleteContact(row.email)
     
    }

    const createColumns = () => {
      return [
        {
          type: 'selection',
          disabled() {
            return
          },
        },
        {
          title: 'Nom ',
          key: 'name',
        },
        {
          title: 'Email',
          key: 'email',
        },
        {
          title: 'Action',
          key: 'actions',
          render(row: any) {
            return h(
              NButton,
              {
                size: 'small',
                onClick: () => deleteContact(row),
              },
              { default: () => 'supprimer le contact' }
            )
          },
        },
      ]
    }

    const formRef = ref(null)

    const form = ref({
      email: null,
      nom: null,
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
      nom: {
        required: true,
        message: 'Veuillez entrer le nom du destinataire',
        trigger: ['blur', 'input'],
      },
    }

    const validateForm = (event: any) => {
      const contact = useContactStore()
      event.preventDefault()
      formRef.value.validate((errors: any) => {
        if (!errors) {
          contact.addContact(form.value.nom, form.value.email).catch((error) => {
            window.$message.error("erreur lors de l'enregistrement")
          })
        } else {
          window.$message.error('Merci de renseigner tous les champs')
          return
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
      validateForm,
      columns: createColumns(),
      data,
      loading: isLoading,
    }
  },

  watch: {
    data() {
      const contactStore = useContactStore()
      return contactStore.getContacts()
    },
  },
})
</script>
