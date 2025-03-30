<script setup lang="ts">
import { ref, watch } from 'vue';
import { VForm } from 'vuetify/components/VForm';
import { Task } from "../database/TaskDatabase";

const open = defineModel('open', {
  type: Boolean,
  default: false
})

const props = defineProps<{
  createTask: (task: Task) => void
}>()

const task = ref<Task>({
  name: '',
  description: '',
  done: false,
  createdAt: new Date(),
  updatedAt: new Date()
})

const form = ref<VForm | null>(null)

const nameRules = [
  (v: string) => !!v || 'Name ist erforderlich'
]

watch(open, (newOpen) => {
  if (newOpen) {
    task.value = {
      name: '',
      description: '',
      done: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
})

async function createTaskInternal() {
  task.value.createdAt = new Date()
  task.value.updatedAt = new Date()
  props.createTask(task.value)
  open.value = false
}

async function validateAndCreateTask() {
  if (form.value) {
    const validation =  await form.value.validate()
    if(validation.valid)
      createTaskInternal()
  }
}
</script>

<template>
  <v-navigation-drawer 
    temporary
    v-model="open"
    location="right" 
    width="500" 
    persistent 
  >
    <v-form ref="form">
      <v-container>
        <v-row>
          <v-col cols="12">
            <div class="text-h4 font-weight-black">Neue Aufgabe</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="task.name"
              label="Name"
              :rules="nameRules"
              variant="outlined"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-textarea v-model="task.description" label="Beschreibung" variant="outlined" rows="4"></v-textarea>
          </v-col>
        </v-row>
        <v-row align-content="end">
          <v-col cols="auto" align-self="end">
            <v-btn variant="outlined" color="error" @click="open = false">
              Abbrechen
            </v-btn>
          </v-col>
          <v-col cols="auto" align-self="end">
            <v-btn variant="outlined" color="success" @click="validateAndCreateTask">
              Anlegen
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-navigation-drawer>
</template>
<style scoped>
</style>