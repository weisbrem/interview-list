<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { getFirestore, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { useToast } from 'primevue/usetoast'

import { useUserStore } from '@/stores/user'

import type { IInterview, IInterviewStage } from '@/types/interview.interface'

const db = getFirestore()
const userStore = useUserStore()
const route = useRoute()
const toast = useToast()

const interview = ref<IInterview>()

const isLoading = ref<boolean>(true)

const docRef = doc(db, `users/${userStore.userId}/interviews`, route.params.id as string)

const addStage = () => {
  if (!interview.value) {
    return
  }

  if (!interview.value.stages) {
    interview.value.stages = []
  }

  interview.value.stages.push({
    name: '',
    date: null,
    description: ''
  })
}

const removeStage = (index: number) => {
  if (!interview.value) {
    return
  }

  interview.value.stages?.splice(index, 1)
}

const saveInterview = async () => {
  try {
    isLoading.value = true

    await updateDoc(docRef, { ...interview.value })
    await getData()
  } catch (error) {
    if (error instanceof Error) {
      toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
    }
  } finally {
    isLoading.value = false
  }
}

const getData = async () => {
  try {
    isLoading.value = true

    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data() as IInterview

      if (data.stages && data.stages.length) {
        data.stages = data.stages.map((stage: IInterviewStage) => {
          if (stage.date && stage.date instanceof Timestamp) {
            return {
              ...stage,
              date: stage.date.toDate()
            }
          }

          return stage
        })
      }

      interview.value = data
    }
  } catch (error) {
    if (error instanceof Error) {
      toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => await getData())
</script>

<template>
  <app-progress-spinner v-if="isLoading" />

  <div v-else-if="interview?.id && !isLoading" class="content-interview">
    <app-card>
      <template #title>Собеседование в компанию {{ interview.company }}</template>
      <template #content>
        <div class="flex flex-column gap-2">
          <label for="company">Компания</label>
          <app-input-text v-model="interview.company" id="company" class="input mb-3" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="vacancyLink">Описание вакансии (ссылка)</label>
          <app-input-text v-model="interview.vacancyLink" id="vacancyLink" class="input mb-3" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="hrName">Контакт (имя)</label>
          <app-input-text v-model="interview.hrName" id="hrName" class="input mb-3" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="contactTelegram">Telegram username HR</label>
          <app-input-text
            v-model="interview.contactTelegram"
            id="contactTelegram"
            class="input mb-3"
          />
        </div>
        <div class="flex flex-column gap-2">
          <label for="contactWhatsApp">WhatsApp HR</label>
          <app-input-text
            v-model="interview.contactWhatsApp"
            id="contactWhatsApp"
            class="input mb-3"
          />
        </div>
        <div class="flex flex-column gap-2">
          <label for="contactPhone">Телефона HR</label>
          <app-input-text v-model="interview.contactPhone" id="contactPhone" class="input mb-3" />
        </div>

        <div class="flex flex-wrap gap-3 p-fluid mb-3">
          <div class="flex-auto">
            <app-input-number
              v-model="interview.salaryFrom"
              inputId="salaryFrom"
              placeholder="Зарплатная вилка от"
            />
          </div>
          <div class="flex-auto">
            <app-input-number
              v-model="interview.salaryTo"
              inputId="salaryTo"
              placeholder="Зарплатная вилка до"
            />
          </div>
        </div>

        <app-button
          @click="addStage"
          class="mb-3"
          severity="info"
          icon="pi pi-plus"
          label="Добавить этап"
        />

        <template v-if="interview.stages">
          <div v-for="(stage, index) in interview.stages" :key="index" class="interview-stage">
            <div class="flex flex-column gap-2">
              <label :for="`stage-name-${index}`">Название этапа</label>
              <app-input-text v-model="stage.name" :id="`stage-name-${index}`" class="input mb-3" />
            </div>
            <div class="flex flex-column gap-2">
              <label :for="`stage-date-${index}`">Дата прохождения этапа</label>
              <app-calendar
                :id="`stage-date-${index}`"
                class="input mb-3"
                dateFormat="dd.mm.yy"
                v-model="stage.date"
              />
            </div>

            <div class="flex flex-column gap-2">
              <label :for="`stage-description-${index}`">Комментарий</label>
              <app-textarea
                v-model="stage.description"
                :id="`stage-description-${index}`"
                class="input mb-3"
                rows="5"
              />
            </div>

            <app-button
              @click="removeStage(index)"
              class="mb-3"
              severity="danger"
              icon="pi pi-trash"
              label="Удалить этап"
            />
          </div>
        </template>

        <div class="flex flex-wrap gap-3 mb-3">
          <div class="flex aling-items-center">
            <app-radio-button
              v-model="interview.result"
              inputId="interviewResult1"
              name="result"
              value="Refusal"
            />
            <label for="interviewResult1" class="ml-2">Отказ</label>
          </div>
          <div class="flex aling-items-center">
            <app-radio-button
              v-model="interview.result"
              inputId="interviewResult2"
              name="result"
              value="Offer"
            />
            <label for="interviewResult2" class="ml-2">Оффер</label>
          </div>
        </div>

        <app-button @click="saveInterview" icon="pi pi-save" label="Сохранить" />
      </template>
    </app-card>
  </div>
</template>

<style scoped>
.content-interview {
  max-width: 600px;
  margin: auto;
}
.input {
  width: 100%;
}
.interview-stage {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
}
</style>
