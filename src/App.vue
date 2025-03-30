<script setup lang="ts">
import { onMounted, ref, onBeforeMount } from "vue";
import { RouterView } from 'vue-router'

import { mdiCogs, mdiHome,mdiCheckboxMarkedCircleOutline,mdiAccountCircle } from '@mdi/js';
import { useSettingsStore } from "./store";
import { Migrator } from "kysely";
import taskDb from "./database/TaskDatabase";
import { CustomMigrationProvider } from "./database/CustomMigrationProvider";

const settingsStore = useSettingsStore();

const items = ref([
        {
          title: 'Home',
          value: 1,
          props: {
            prependIcon: mdiHome,
            to: 'home'
          },
        },
        {
          type: 'subheader',
          title: 'Zeiterfassung',
          props: {
            prependIcon: mdiHome
          },
        },
        
        {
          title: 'Aufgaben',
          value: 2,
          props: {
            prependIcon: mdiCheckboxMarkedCircleOutline,
            to: 'taskList'
          },
        },
        {
          title: 'Einstellungen',
          value: 3,
          props: {
            prependIcon: mdiCogs,
            to: 'settings'
          },
        }
      ])

  onMounted(()=>{
    let topBar = document.getElementById("titlebar");
    topBar?.children[0].setAttribute("data-tauri-drag-region", "");
  })

  onBeforeMount(async ()=>{
    const migrator = new Migrator({
      db: taskDb,
      provider: new CustomMigrationProvider(),
    });

    const { error, results } = await migrator.migrateToLatest();

    if (error) {
      console.error('Migration failed:', error);
      // Handle the error as needed
    } else {
      console.log('Migrations applied successfully:', results);
    }
  })

</script>

<template>
  
  <Suspense>
    <template #default>
        <v-responsive class="border rounded" >
        
        <v-app>
          
          <v-app-bar data-tauri-drag-region id="titlebar" density="compact" height="45" ></v-app-bar>
          

          <v-navigation-drawer
                expand-on-hover
                rail
                permanent
              >
                <v-list>
                  <v-list-item>
                    <v-list-item-title>Marc</v-list-item-title>
                    <v-list-item-subtitle>marc@lammers.dev</v-list-item-subtitle>
                    <template v-slot:prepend>
                      <v-icon :icon="mdiAccountCircle"></v-icon>
                    </template>
                  </v-list-item>
                </v-list>
                <v-divider></v-divider>
                <v-list density="compact" :items="items" nav />
          </v-navigation-drawer>

          <v-main class="main-content" :style="{backgroundImage:`url(${settingsStore.appBackground})`}">
            <v-container fluid class="main-container" >
              <RouterView /> 
            </v-container>
          </v-main>
        </v-app>
      </v-responsive>
    </template>
    <template #fallback>
      <div>Laden...</div> 
    </template> 
  </Suspense>
</template>


<style lang="scss">
$main-color: #329ea3;
$titlebar-height: 45px;

:root {
  overflow: hidden;

  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: #0f0f0f;
  background-color: #f6f6f6;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.main-content {
  background-size: cover;
}

.main-container {
  height: calc(100vh - $titlebar-height);
  overflow: auto;
}
.main-content {
  margin-top: 15px;
}

</style>