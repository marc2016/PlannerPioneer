<script setup lang="ts">
import { ref, watch } from 'vue';
import { VForm } from 'vuetify/components/VForm';
import { hasPersonChanged } from '../helper/PersonHelper'
import { Person } from '../database/Types';

const open = defineModel('open', {
  type: Boolean,
  default: false
})

const selectedPerson = defineModel('person', {
  type: Object,
  default: null
})

const internalPerson = ref<Person | null>(null)

const form = ref<VForm | null>(null)

const nameRules = [
  (v: string) => !!v || 'Name ist erforderlich'
]

watch(open, async (newOpen) => {
  if (newOpen) {
    internalPerson.value = selectedPerson.value ? { ...selectedPerson.value } : null
  } else {
    if (form.value) {
      const validationResult = await form.value.validate()
      if (!validationResult.valid) {
        open.value = true
        return
      }
    }
    if (internalPerson.value && selectedPerson.value && hasPersonChanged(internalPerson.value, selectedPerson.value)) {
      internalPerson.value.updatedAt = new Date()
      Object.assign(selectedPerson.value, internalPerson.value)
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
            <div class="text-h4 font-weight-black">Person bearbeiten</div>
          </v-col>
        </v-row>
        <v-row v-if="internalPerson">
          <v-col cols="12">
            <v-text-field
              v-model="internalPerson.name"
              label="Name"
              :rules="nameRules"
              variant="outlined"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row v-if="internalPerson">
          
        </v-row>
      </v-container>
    </v-form>
  </v-navigation-drawer>
</template>

<style scoped>
</style>