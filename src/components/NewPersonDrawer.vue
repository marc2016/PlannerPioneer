<script setup lang="ts">
import { ref, watch } from 'vue';
import { VForm } from 'vuetify/components/VForm';
import { Person } from '../database/Types';

const open = defineModel('open', {
  type: Boolean,
  default: false
})

const props = defineProps<{
  createPerson: (person: Person) => void
}>()

const person = ref<Person>({
  id: BigInt(0),
  name: '',
  createdAt: new Date(),
  updatedAt: new Date()
})

const form = ref<VForm | null>(null)

const nameRules = [
  (v: string) => !!v || 'Name ist erforderlich'
]

watch(open, (newOpen) => {
  if (newOpen) {
    person.value = {
      id: BigInt(0),
      name: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
})

async function createPersonInternal() {
  person.value.createdAt = new Date()
  person.value.updatedAt = new Date()
  props.createPerson(person.value)
  open.value = false
}

async function validateAndCreatePerson() {
  if (form.value) {
    const validation =  await form.value.validate()
    if(validation.valid)
      createPersonInternal()
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
            <div class="text-h4 font-weight-black">Neue Person</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="person.name"
              label="Name"
              :rules="nameRules"
              variant="outlined"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            
          </v-col>
        </v-row>
        <v-row align-content="end">
          <v-col cols="auto" align-self="end">
            <v-btn variant="outlined" color="error" @click="open = false">
              Abbrechen
            </v-btn>
          </v-col>
          <v-col cols="auto" align-self="end">
            <v-btn variant="outlined" color="success" @click="validateAndCreatePerson">
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