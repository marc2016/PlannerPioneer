<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '../store'

// Array von Listenelementen mit Bildern
const appBackgroundsConst = ref([
  { id: 0, text: 'Listenelement 1', img: 'src/assets/backgrounds/01.jpg' },
  { id: 1, text: 'Listenelement 2', img: 'src/assets/backgrounds/02.jpg' },
  { id: 2, text: 'Listenelement 3', img: 'src/assets/backgrounds/03.jpg' },
  { id: 3, text: 'Listenelement 4', img: 'src/assets/backgrounds/04.jpg' },
  { id: 4, text: 'Listenelement 5', img: 'src/assets/backgrounds/05.jpg' }
])

const store = await useSettingsStore()
</script>

<template>
  <v-card>
    <v-card-title>Hintergrund</v-card-title>
    <v-list class="d-flex flex-row" v-model:selected="store.appBackground">
      <!-- Durchlaufen des listItems-Arrays und Erstellen von Listenelementen mit Bildern -->
      <v-list-item 
        v-for="(item, index) in appBackgroundsConst" 
        :key="index" 
        :value="item.img"
        color="primary"
        class="mx-2">
        <v-img :src="item.img" alt="List item image" rounded="lg" width="120"></v-img>
        <!-- <v-list-item-title>{{ item.text }}</v-list-item-title> -->
      </v-list-item>
    </v-list>
  </v-card>
  
</template>

<style scoped>
.d-flex {
  display: flex;
}
.flex-row {
  flex-direction: row;
}
.mx-2 {
  margin-left: 8px;
  margin-right: 8px;
}
.selected {
  background-color: #e0e0e0; /* Highlight selected item */
}
</style>
