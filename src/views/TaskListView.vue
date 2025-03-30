<script setup lang="ts">

  import { computed, ref, watch } from 'vue'
  import { mdiPlus } from '@mdi/js'
  import taskDb from "../database/TaskDatabase";
  import TaskView from '../components/TaskView.vue'
  import NewTaskDrawer from '../components/NewTaskDrawer.vue'
import EditTaskDrawer from '../components/EditTaskDrawer.vue'
import { Task } from '../database/TaskTypes';

  const tasksTest = await taskDb.selectFrom('task').selectAll().execute();

  // const tasks = ref<Task[]>(await taskDb.tasks.toArray())
  const allTasks = ref<Task[]>(tasksTest)
  const openTasks = computed(() => allTasks.value.filter(task => !task.done).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()))
  const doneTasks = computed(() => allTasks.value.filter(task => task.done).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()))

  const newTaskDrawer = ref(false)
  const editTaskDrawer = ref(false)
  const selectedTask = ref<Task | null>(null)
  let shouldWatch = true

  async function openNewTask() {
    newTaskDrawer.value = true
  }

  async function addNewTask(newTask : Task) {
    allTasks.value.unshift(newTask)
  }

  watch(newTaskDrawer, (newDrawer) => {
    if (!newDrawer) {
      selectedTask.value = null
    }
  })

  function openTaskDetails(task: Task) {
    editTaskDrawer.value = !editTaskDrawer.value
    selectedTask.value = task
  }

  function doneTask(task: Task) {
    task.done = true
    task.updatedAt = new Date()
  }

  function reopenTask(task: Task) {
    task.done = false
    task.updatedAt = new Date()
  }

  async function deleteTask(task: Task) {    
    const index = allTasks.value.indexOf(task)
    allTasks.value.splice(index, 1)
    await taskDb.deleteFrom('task').where('id', '=', task.id).execute()
  }

  function deepCopyTask(task: Task): Task {
    return {
      id: task.id,
      name: task.name,
      description: task.description,
      done: task.done,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    }
  }


  watch(allTasks, async (newTasks) => {
    if (!shouldWatch) return
    shouldWatch = false
    for (const task of newTasks) {
      if (task.id) {
        await taskDb.updateTable('task').set(task).where('id', '=', task.id).execute()
      } else {
        const taskCopy = deepCopyTask(task)
        const result = await taskDb.insertInto('task').values(taskCopy).execute()
        if(result.length > 0 && result[0].insertId !== undefined)
          task.id = result[0].insertId
      }
    }
    shouldWatch = true
  }, { deep: true })



</script>

<template>
  <Suspense>
    <template #default>
      <div>
        <NewTaskDrawer :createTask="addNewTask" v-model:open="newTaskDrawer" ></NewTaskDrawer>
        <EditTaskDrawer v-model:task="selectedTask" v-model:open="editTaskDrawer" ></EditTaskDrawer>
        <transition-group name="list" tag="v-list" class="task-list d-flex flex-wrap">
          <template v-for="(task) in openTasks" :key="task.id" class="d-flex flex-wrap">
            <v-list-item>
              <TaskView :task="task" :doneTask="doneTask" :reopenTask="reopenTask" :openTaskDetails="openTaskDetails" :deleteTask="deleteTask"></TaskView>
            </v-list-item>
          </template>
          <v-divider color="darkgray" class="border-opacity-100 mt-8 mb-8"></v-divider>
          <template v-for="(task) in doneTasks" :key="task.id" class="d-flex flex-wrap">
            <v-list-item>
              <TaskView :task="task" :doneTask="doneTask" :reopenTask="reopenTask" :openTaskDetails="openTaskDetails" :deleteTask="deleteTask"></TaskView>
            </v-list-item>
          </template>
        </transition-group>
        
        <v-fab :icon="mdiPlus" class="fab-button" @click="openNewTask"></v-fab>
      </div>
    </template>
    <template #fallback></template>
  </Suspense>
</template>

<style scoped>
.task-list {
  background-color: transparent;
  display: flex;
  flex-wrap: wrap;
  overflow-x: auto;
}

.d-flex {
  display: flex;
}
.flex-column {
  flex-direction: column;
}
.flex-grow-1 {
  flex-grow: 1;
}
.flex-row {
  flex-direction: row;
}
.align-center {
  align-items: center;
}
.fab-button {
  position: fixed;
  bottom: 25px;
  right: 25px;
  z-index: 1000;
}
.card-max-width {
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
.full-height {
  height: 100%;
}
.card-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

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