<script setup lang="ts">

  import { computed, ref, watch } from 'vue'
  import { mdiPlus } from '@mdi/js'
  import EditPersonDrawer from '../components/EditPersonDrawer.vue'
  import NewPersonDrawer from '../components/NewPersonDrawer.vue'
  import database from '../database/Database'
  import { PersonDb } from '../database/Types'
  import PersonCard from '../components/PersonCard.vue'
import { Person } from '../models/Person'
import { PersonRepository } from '../repositories/PersonRepository'

  const personRepository = new PersonRepository()
  const persons = await personRepository.getAll();

  const allPersons = ref<Person[]>(persons)

  const allPersonsSorted = computed(() => (allPersons.value.sort((a, b) => {
    return b.updatedAt.getTime() - a.updatedAt.getTime()
  })))

  const newPersonDrawer = ref(false)
  const editPersonDrawer = ref(false)
  const selectedPerson = ref<Person | null>(null)
  let shouldWatch = true

  async function openNewPersonDrawer() {
    newPersonDrawer.value = true
  }

  async function addNewPerson(newPerson: Person) {
    allPersons.value.unshift(newPerson)
  }

  watch(newPersonDrawer, (newDrawer) => {
    if (!newDrawer) {
      selectedPerson.value = null
    }
  })

  function openPersonDetails(person: Person) {
    editPersonDrawer.value = !editPersonDrawer.value
    selectedPerson.value = person
  }

  async function deletePerson(person: Person) {    
    await personRepository.delete(person)
  }

  function deepCopyPerson(person: PersonDb): PersonDb {
    return {
      id: person.id,
      name: person.name,
      createdAt: new Date(person.createdAt),
      updatedAt: new Date(person.updatedAt)
    }
  }

  watch(allPersons, async (newPersons) => {
    if (!shouldWatch) return
    shouldWatch = false
    for (const person of newPersons) {
      const newPerson = await personRepository.createOrUpdate(person);
      if (newPerson) {
        person.id = newPerson.id
        // person.createdAt = newPerson.createdAt
        // person.updatedAt = newPerson.updatedAt
      }
      
      // if (person.id) {
      //   await database.updateTable('person').set(person).where('id', '=', person.id).execute()
      // } else {
      //   const personCopy = deepCopyPerson(person)
      //   personCopy.id = undefined
      //   const result = await database.insertInto('person').values(personCopy).execute()
      //   if(result.length > 0 && result[0].insertId !== undefined)
      //     person.id = BigInt(result[0].insertId); 
      // }
    }
    shouldWatch = true
  }, { deep: true })

</script>

<template>
  <Suspense>
    <template #default>
      <div>
        <NewPersonDrawer :create-person="addNewPerson" v-model:open="newPersonDrawer"></NewPersonDrawer>
        <EditPersonDrawer v-model:person="selectedPerson" v-model:open="editPersonDrawer"></EditPersonDrawer>
        <transition-group name="list" tag="v-list" class="person-list d-flex flex-wrap">
          <template v-for="(person) in allPersonsSorted" :key="person.id" class="d-flex flex-wrap">
            <v-list-item>
              <PersonCard :person="person" :open-person-details="openPersonDetails" :delete-person="deletePerson"></PersonCard>
            </v-list-item>
          </template>
        </transition-group>
        <v-fab :icon="mdiPlus" class="fab-button" @click="openNewPersonDrawer"></v-fab>
      </div>
    </template>
    <template #fallback></template>
  </Suspense>
</template>

<style scoped>
.person-list {
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