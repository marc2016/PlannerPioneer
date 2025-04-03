<script setup lang="ts">
import { mdiAccount, mdiTrashCan, mdiCheckCircleOutline, mdiUpdate } from '@mdi/js'
import { computed } from 'vue'
import { Person } from '../database/Types';

const props = defineProps<{ 
  person: Person,
  openPersonDetails: (person: Person) => void,
  deletePerson: (person: Person) => void
}>()

const formattedDate = computed(() => {
  const date = new Date(props.person.updatedAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
})
</script>

<template>
  <v-card outlined hover link @click="openPersonDetails(person)" class="card-max-width card-max-height d-flex flex-column bg-grey-lighten-4" >
    <!-- <transition name="fade">
      <v-icon v-if="task.done" :icon="mdiCheckCircleOutline" size="200" class="background-icon text-green-lighten-4"></v-icon>
      <v-icon v-else :icon="mdiRecordCircleOutline" size="200" class="background-icon text-orange-lighten-4"></v-icon>
    </transition> -->
    <v-icon  :icon="mdiAccount" size="200" class="background-icon text-blue-lighten-4"></v-icon>
    <v-card-title class="multiline-title">{{ person.name }}</v-card-title>
    <v-card-text class="flex-grow-1 multiline-text"></v-card-text>
    <v-card-item>
      <div class="date-container" v-if="person.updatedAt">
      <v-icon size="16" :icon="mdiUpdate"></v-icon>
      <v-label class="text-caption date-label">{{ formattedDate }}</v-label>
    </div>
    </v-card-item>
    
    <v-divider></v-divider>
    <v-card-actions class="card-actions bg-white" @click.stop>
      <v-spacer></v-spacer>

      <v-btn
        color="medium-emphasis"
        :icon="mdiTrashCan"
        size="small"
        @click.stop
        @click="deletePerson(person)"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.background-icon {
  position: absolute;
  top: 50%;
  left: 85%;
  transform: translate(-50%, -50%);
  z-index: -1; /* Ensure it is behind other elements */
}
.card-max-width {
  position: relative; /* Ensure the icon is positioned relative to the card */
  width: 300px;
}
.card-max-height {
  height: 200px; /* Set the maximum height for the card */
  overflow: hidden; /* Hide overflow content */
}
.multiline-title {
  white-space: normal;
  word-wrap: break-word;
}
.multiline-text {
  white-space: pre-wrap; /* Respect new lines */
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Limit the number of lines */
  -webkit-box-orient: vertical;
}
.date-container {
  display: flex;
  align-items: center;
}
.date-label {
  margin-left: 6px; /* Adjust the margin as needed */
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 1.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
</style>