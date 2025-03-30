<script setup lang="ts">
import { ref, watch } from 'vue';
import { VForm } from 'vuetify/components/VForm';
import { hasTaskChanged } from '../helper/TaskHelper'
import { Task } from "../database/TaskDatabase";

const open = defineModel('open', {
  type: Boolean,
  default: false
})

const selectedTask = defineModel('task', {
  type: Object,
  default: null
})

const internalTask = ref<Task | null>(null)

const form = ref<VForm | null>(null)

const nameRules = [
  (v: string) => !!v || 'Name ist erforderlich'
]



watch(open, async (newOpen) => {
  if (newOpen) {
    internalTask.value = selectedTask.value ? { ...selectedTask.value } : null
  } else {
    if (form.value) {
      const validationResult = await form.value.validate()
      if (!validationResult.valid) {
        open.value = true
        return
      }
    }
    if (internalTask.value && selectedTask.value && hasTaskChanged(internalTask.value, selectedTask.value)) {
      internalTask.value.updatedAt = new Date()
      Object.assign(selectedTask.value, internalTask.value)
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
            <div class="text-h4 font-weight-black">Aufgabe bearbeiten</div>
          </v-col>
        </v-row>
        <v-row v-if="internalTask">
          <v-col cols="12">
            <v-text-field
              v-model="internalTask.name"
              label="Name"
              :rules="nameRules"
              variant="outlined"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row v-if="internalTask">
          <v-col cols="12">
            <v-textarea v-model="internalTask.description" label="Beschreibung" variant="outlined" rows="4"></v-textarea>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-navigation-drawer>
</template>

<style scoped>
</style>