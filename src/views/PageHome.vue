<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import { getFirestore, setDoc, doc } from 'firebase/firestore'

import { useUserStore } from '@/stores/user'

import type { IInterview } from '@/types/interview'

const db = getFirestore()
const router = useRouter()
const userStore = useUserStore()

const company = ref<string>('')
const vacancyLink = ref<string>('')
const hrName = ref<string>('')
const contactTelegram = ref<string>('')
const contactWhatsApp = ref<string>('')
const contactPhone = ref<string>('')

const isLoading = ref<boolean>(false)

const disabledSaveButton = computed<boolean>(() => {
  return !(company.value && vacancyLink.value && hrName.value)
})

const addNewInterview = async () => {
  isLoading.value = true

  const payload: IInterview = {
    id: uuidv4(),
    createdAt: new Date(),
    company: company.value,
    vacancyLink: vacancyLink.value,
    hrName: hrName.value,
    contactTelegram: contactTelegram.value,
    contactWhatsApp: contactWhatsApp.value,
    contactPhone: contactPhone.value
  }

  const userId = userStore.userId

  if (userId) {
    await setDoc(doc(db, `users/${userId}/interviews`, payload.id), payload)
    await router.push({ name: 'List' })
  }

  isLoading.value = false
}
</script>

<template>
  <div class="content-interview">
    <app-card>
      <template #title>Новое собеседование</template>
      <template #content>
        <app-input-text class="input mb-3" placeholder="Компания" v-model="company" />
        <app-input-text
          v-model="vacancyLink"
          class="input mb-3"
          placeholder="Описание вакансии (ссылка)"
        />
        <app-input-text v-model="hrName" class="input mb-3" placeholder="Контакт (имя)" />
        <app-input-text
          v-model="contactTelegram"
          class="input mb-3"
          placeholder="Telegram username HR"
        />
        <app-input-text
          v-model="contactWhatsApp"
          class="input mb-3"
          placeholder="WhatsApp телефон HR"
        />
        <app-input-text v-model="contactPhone" class="input mb-3" placeholder="Телефон HR" />
        <app-button
          @click="addNewInterview"
          label="Создать собеседование"
          :disabled="disabledSaveButton"
          :loading="isLoading"
        ></app-button>
      </template>
    </app-card>
  </div>
</template>

<style scoped>
.input {
  width: 100%;
}
.content-interview {
  max-width: 600px;
  margin: auto;
}
</style>
