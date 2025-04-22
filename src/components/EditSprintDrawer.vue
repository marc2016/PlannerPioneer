<script setup lang="ts">
import { ref, watch } from 'vue';
import { VForm } from 'vuetify/components/VForm';
import { hasPersonChanged } from '../helper/PersonHelper'
import { Person, Sprint } from '../database/Types';

const open = defineModel('open', {
  type: Boolean,
  default: false
})

const selectedSprint = defineModel('sprint', {
  type: Object,
  default: null
})

const internalSprint = ref<Sprint | null>(null)
const selectedDate = ref<Date[] | null>(null)

const form = ref<VForm | null>(null)

const nameRules = [
  (v: string) => !!v || 'Name ist erforderlich'
]

function dateFormat(val: string | Date): string {
  const date = new Date(val)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`

}

function getAllDatesBetween(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate)); // Add a copy of the current date
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  return dates;
}

watch(selectedDate, (newDate: any) => {
  if(!newDate || !internalSprint.value)
    return
  const startDate = newDate[0]
  const endDate = newDate[newDate.length - 1]
  internalSprint.value.startDate = new Date(startDate)
  internalSprint.value.endDate = new Date(endDate)
})

watch(open, async (newOpen) => {
  if (newOpen) {
    internalSprint.value = selectedSprint.value ? { ...selectedSprint.value } : null
    if (internalSprint.value) {
      selectedDate.value = getAllDatesBetween(internalSprint.value.startDate, internalSprint.value.endDate)
    } else {
      selectedDate.value = null
    }
  } else {
    if (form.value) {
      const validationResult = await form.value.validate()
      if (!validationResult.valid) {
        open.value = true
        return
      }
    }
    if (internalSprint.value && selectedSprint.value ) {
      internalSprint.value.updatedAt = new Date()
      Object.assign(selectedSprint.value, internalSprint.value)
    }
  }
})

</script>

<template>
  <v-navigation-drawer 
    temporary
    v-model="open"
    location="right" 
    width="500" 
  >
    <v-form ref="form">
      <v-container>
        <v-row>
          <v-col cols="12">
            <div class="text-h4 font-weight-black">Sprint bearbeiten</div>
          </v-col>
        </v-row>
        <v-row v-if="internalSprint">
          <v-col cols="12">
            <v-text-field
              v-model="internalSprint.name"
              label="Name"
              :rules="nameRules"
              variant="outlined"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row v-if="internalSprint">
          <v-col cols="12">
            <v-date-input :display-format="dateFormat" label="Start und Ende" variant="outlined" multiple="range" prepend-icon="" v-model:="selectedDate"></v-date-input>
          </v-col>
          
          <!-- <v-date-picker :multiple="'range'" show-adjacent-months show-week title="Start und Ende"></v-date-picker> -->
        </v-row>
      </v-container>
    </v-form>
  </v-navigation-drawer>
</template>

<style scoped>
</style>