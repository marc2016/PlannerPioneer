<script setup lang="ts">
import { mdiCalendarMonth, mdiTrashCan, mdiPencil, mdiPlus } from '@mdi/js'
import { computed } from 'vue'
import { PersonDb, Sprint, Task } from '../database/Types';
import TaskCard from './TaskCard.vue';
import database from '../database/Database';

const props = defineProps<{ 
  sprint: Sprint,
  deleteSprint: (sprint: Sprint) => void,
  editSprint: (sprint: Sprint) => void,
}>()

// Helper function to format dates as dd.mm.yyyy with leading zeros
function formatDate(date: string | Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0'); // Add leading zero to day
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Add leading zero to month
  const year = d.getFullYear();
  return `${day}.${month}.${year}`; // Format as dd.mm.yyyy
}

// Helper function to calculate working days between two dates
function calculateWorkingDays(startDate: string | Date, endDate: string | Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) { // Exclude Sundays (0) and Saturdays (6)
      count++;
    }
  }

  return count;
}

async function addNewTask() {
  const sprintId = Number(props.sprint.id);
  const newTask: Task = {
    id: undefined,
    name: 'Task 1',
    description: 'Description of Task 1',
    createdAt: new Date(),
    updatedAt: new Date(),
    sprintId: sprintId,
    done: false,
  }
  const result1 = await database.insertInto('task').values(newTask).execute()
  newTask.id = result1[0].insertId
  if(props.sprint.tasks === undefined) {
    props.sprint.tasks = []
  }
  props.sprint.tasks.push(newTask)
}


</script>

<template>
  <v-card class="mx-auto card-background">
    <template v-slot:title>
      <div :class="['title-container']">
        <div class="text-h6 sprint-name">{{sprint.name}}</div>
        <!-- <div class="vertical-line"></div> -->
        <!-- <v-icon :icon="mdiCalendarMonth" size="x-small" class="text-h6 sprint-name"></v-icon> -->
        <v-chip :prepend-icon="mdiCalendarMonth" variant="flat" color="grey-lighten-1" >
          {{ formatDate(sprint.startDate) }} - {{ formatDate(sprint.endDate) }}
          ({{ calculateWorkingDays(sprint.startDate, sprint.endDate) }} Tage)
        </v-chip>
        <!-- <div :class="['text-h6', 'sprint-name', { 'invalid-date': sprint.dateOverlapping }]">
          {{ formatDate(sprint.startDate) }} - {{ formatDate(sprint.endDate) }}
          ({{ calculateWorkingDays(sprint.startDate, sprint.endDate) }} Tage)
        </div> -->
        <!-- <div class="vertical-line"></div> -->
        <v-chip variant="flat" color="grey-lighten-1">
          <v-btn :icon="mdiPencil" variant="plain" elevation="0" size="small" @click="editSprint(props.sprint)"></v-btn>
          <v-btn :icon="mdiTrashCan" variant="plain" elevation="0" size="small" @click="deleteSprint(props.sprint)"></v-btn>
        </v-chip>
        
      </div>
    </template>
    <template v-slot:text>
      <v-list dense class="transparent-list horizontal-list">
        <v-list-item-group v-for="task in sprint.tasks" :key="task.id">
          <v-list-item>
            <TaskCard
              :task="task"
              :openTaskDetails="() => {}"
              :reopenTask="() => {}"
              :doneTask="() => {}"
              :deleteTask="() => {}"
            />
          </v-list-item>
        </v-list-item-group>
        <v-list-item>
          <v-btn :icon="mdiPlus" elevation="0" @click="addNewTask"></v-btn>
        </v-list-item>
      </v-list>
    </template>
  </v-card>
</template>

<style scoped>
.card-background {
  background-color: rgba(255, 255, 255, 0.7); /* Set background opacity */
}

.invalid-date {
  background-color: rgba(255, 0, 0, 0.2); /* Light red background for invalid dates */
}

.title-container {
  display: flex; /* Use flexbox for horizontal layout */
  justify-content: flex-start; /* Align items horizontally */
  align-items: center; /* Align items vertically in the center */
  gap: 8px; /* Add spacing between elements */
}

.sprint-name {
  display: inline-block; /* Take only as much space as needed */
}

.vertical-line {
  width: 1px; /* Set the width of the vertical line */
  height: 24px; /* Set the height of the vertical line */
  background-color: rgb(0, 0, 0); /* Set the color and opacity of the line */
}

.transparent-list {
  background-color: transparent; /* Make v-list background transparent */
}

.horizontal-list {
  display: flex; /* Use flexbox for horizontal layout */
  flex-direction: row; /* Set items to align horizontally */
  gap: 16px; /* Add spacing between items */
  padding: 0; /* Remove default padding */
}

.last-item-card {
  background-color: rgba(240, 240, 240, 0.9); /* Slightly different background for the last card */
  padding: 16px;
  text-align: center;
}
</style>