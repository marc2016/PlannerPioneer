<script setup lang="ts">
  import database from '../database/Database';
  import { mdiPlus } from '@mdi/js';
import { Sprint, Task } from '../database/Types';
import { ref, watch, computed } from 'vue';
import SprintCard from '../components/SprintCard.vue';
import { da } from 'vuetify/locale';

function deepCopySprint(sprint: Sprint): Sprint {
  return JSON.parse(JSON.stringify(sprint));
}
import EditSprintDrawer from '../components/EditSprintDrawer.vue';

  function isDateRangeOverlapping(sprint: Sprint, otherSprints: Sprint[]): boolean {
    const sprintStart = new Date(sprint.startDate).getTime();
    const sprintEnd = new Date(sprint.endDate).getTime();

    return otherSprints.some(otherSprint => {
      if (otherSprint.id === sprint.id) return false; // Skip the same sprint
      const otherStart = new Date(otherSprint.startDate).getTime();
      const otherEnd = new Date(otherSprint.endDate).getTime();

      // Check if the date ranges overlap
      return sprintStart <= otherEnd && sprintEnd >= otherStart;
    });
  }

  const dbSprints = await database.selectFrom('sprint').selectAll().execute();
  const allSprints = ref<Sprint[]>(dbSprints)
  const dbTasks = await database.selectFrom('task').selectAll().execute();
  const allTasks = ref<Task[]>(dbTasks)
  allSprints.value.forEach(sprint => {
    allTasks.value.forEach(task => {
      if (task.sprintId !== undefined && sprint.id !== undefined && BigInt(task.sprintId) === BigInt(sprint.id)) {
        sprint.tasks = sprint.tasks || [];
        sprint.tasks.push({
          ...task,
          id: task.id ? { __select__: task.id, __insert__: task.id, __update__: task.id } : undefined
        });
      }
    });
  });

  const sortedSprints = computed(() => {
    return allSprints.value.slice().sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateA - dateB; // Ascending order
    });
  });
  
  let shouldWatch = true

  const editSprintDrawer = ref(false)
  const selectedSprint = ref<Sprint | null>(null)
  // const result = await database.insertInto('sprint')
  //   .values({
  //     name: 'Sprint 1',
  //     startDate: new Date('2023-10-01'),
  //     endDate: new Date('2023-10-14'),
  //     createdAt: new Date(),
  //     updatedAt: new Date()
  //   })
  //   .execute()

  //   if(result[0].insertId !== undefined) {
  //     const sprintId = Number(result[0].insertId);
  //     const result1 = await database.insertInto('task').values({
  //       name: 'Task 1',
  //       description: 'Description of Task 1',
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //       sprintId: sprintId,
  //       done: false,
        
  //     }).execute()
  //   }
  
  async function addNewSprint() {
    const newSprint: Sprint = {
      id: undefined,
      name: 'Sprint 4',
      startDate: new Date('2023-10-01'),
      endDate: new Date('2023-10-14'),
      createdAt: new Date(),
      updatedAt: new Date(),
      tasks: undefined
    }
    const result = await database.insertInto('sprint').values(newSprint).execute()
    if(!result)
      return
    newSprint.id = result[0].insertId
    allSprints.value.unshift(newSprint)
  }

  async function deleteSprint(sprint: Sprint) {
    const index = allSprints.value.indexOf(sprint)
    allSprints.value.splice(index, 1)
    await database.deleteFrom('sprint').where('id', '=', sprint.id).execute()
    if(sprint.id)
      await database.deleteFrom('task').where('sprintId', '=', Number(sprint.id)).execute()
  }
  function editSprint(sprint: Sprint) {
    editSprintDrawer.value = !editSprintDrawer.value
    selectedSprint.value = sprint
  }
  
  watch(allSprints, async (newSprints) => {
    if (!shouldWatch) return
    shouldWatch = false
    for (const sprint of newSprints) {
      if (isDateRangeOverlapping(sprint, newSprints)) {
        sprint.dateOverlapping = true
      } else {
        sprint.dateOverlapping = false
      }
      const sprintDb = { ...sprint, tasks: undefined, dateOverlapping: undefined }

      if (sprint.id) {
        await database.updateTable('sprint').set(sprintDb).where('id', '=', sprint.id).execute()
      } else {
        const sprintCopy = deepCopySprint(sprintDb)
        const result = await database.insertInto('sprint').values(sprintCopy).execute()
        if(result.length > 0 && result[0].insertId !== undefined)
        sprint.id = result[0].insertId
      }
    }
    shouldWatch = true
  }, { deep: true })

</script>

<template>
  <Suspense>
    <template #default>
      <div>
        <EditSprintDrawer v-model:sprint="selectedSprint" v-model:open="editSprintDrawer"></EditSprintDrawer>
        <transition-group name="list" tag="v-list" >
          <template v-for="(sprint) in sortedSprints" :key="sprint.id">
            <v-list-item>
              <SprintCard :sprint="sprint" :delete-sprint="deleteSprint" :edit-sprint="editSprint"></SprintCard>
            </v-list-item>
          </template>
        </transition-group>
        <v-fab :icon="mdiPlus" :app="true" location="bottom right" @click="addNewSprint"></v-fab>
      </div>
    </template>
    <template #fallback></template>
  </Suspense>
</template>

<style scoped>


.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 1s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>