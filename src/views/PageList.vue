<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useUserStore } from '@/stores/user'

import type { IInterview } from '@/types/interview.interface'

const db = getFirestore()
const toast = useToast()
const confirm = useConfirm()
const userStore = useUserStore()

const interviews = ref<IInterview[]>([])
const isLoading = ref<boolean>(true)

const getAllInterviews = async <T extends IInterview>(): Promise<T[]> => {
  const getData = query(
    collection(db, `users/${userStore.userId}/interviews`),
    orderBy('createdAt', 'desc')
  )

  const listDocs = await getDocs(getData)

  return listDocs.docs.map((doc) => doc.data() as T)
}

const confirmRemoveInterview = (id: string) => {
  confirm.require({
    message: 'Вы действительно хотите удалить собеседование?',
    header: 'Подтвердите действие',
    icon: 'pi pi-info-circle',
    rejectLabel: 'Отмена',
    acceptLabel: 'Удалить',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        isLoading.value = true

        await deleteDoc(doc(db, `users/${userStore.userId}/interviews`, id))

        interviews.value = await getAllInterviews()
      } catch (error) {
        if (error instanceof Error) {
          toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
        }
      } finally {
        isLoading.value = false
      }
    }
  })
}

onMounted(async () => {
  try {
    interviews.value = await getAllInterviews()
  } catch (error) {
    if (error instanceof Error) {
      toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <app-confirm-dialog />
  <app-progress-spinner v-if="isLoading" />
  <app-inline-message v-else-if="!interviews.length" severity="info"
    >Нет добавленных собеседований</app-inline-message
  >

  <div v-else>
    <h1>Список собеседований</h1>

    <app-data-table :value="interviews" :loading="isLoading">
      <app-column field="company" header="Компания"></app-column>
      <app-column field="hrName" header="Имя HR"></app-column>
      <app-column field="vacancyLink" header="Вакансия">
        <template #body="slotProps">
          <a :href="slotProps.data.vacancyLink" target="_blank" rel="noopener noreferrer">
            {{ slotProps.data.vacancyLink }}</a
          >
        </template>
      </app-column>

      <app-column field="vacancyLink" header="Контакты">
        <template #body="{ data }">
          <div class="contacts">
            <a
              v-if="data.contactTelegram"
              :href="`https://t.me/${data.contactTelegram}`"
              class="contacts__telegram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="contacts__icon pi pi-telegram"></span>
            </a>
            <a
              v-if="data.contactWhatsApp"
              :href="`https://wa.me/${data.contactWhatsApp}`"
              class="contacts__whatsapp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="contacts__icon pi pi-whatsapp"></span>
            </a>
            <a
              v-if="data.contactPhone"
              :href="`tel:${data.contactPhone}`"
              class="contacts__phone"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="contacts__icon pi pi-phone"></span>
            </a>
          </div>
        </template>
      </app-column>

      <app-column>
        <template #body="{ data }">
          <div class="flex gap-2">
            <router-link
              class="p-button p-button-icon-only p-button-info"
              :to="{ name: 'Interview', params: { id: data.id } }"
            >
              <span class="pi pi-pencil" severity="info" />
            </router-link>
            <app-button
              @click="confirmRemoveInterview(data.id)"
              icon="pi pi-trash"
              severity="danger"
            />
          </div>
        </template>
      </app-column>
    </app-data-table>
  </div>
</template>

<style scoped>
.contacts {
  display: flex;
  align-items: center;
  gap: 20px;
}

.contacts__icon {
  font-size: 20px;
}

.contacts__telegram {
  color: #0088cc;
}

.contacts__whatsapp {
  color: #25d366;
}

.contacts__phone {
  color: #371777;
}
</style>
