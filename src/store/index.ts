import { BaseDirectory, exists, mkdir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const appBackground = ref(0)
  return { appBackground }
})

export async function initSettingsStore() {
  if(await exists('settings.json', { baseDir: BaseDirectory.AppConfig })) {
    const settings = await readTextFile('settings.json', {
      baseDir: BaseDirectory.AppConfig,
    });
    const settingsJson = JSON.parse(settings)
    useSettingsStore().$patch(settingsJson)
  }

  useSettingsStore().$subscribe(async (_, state) => {
    if(!await exists('', { baseDir: BaseDirectory.AppConfig }))
      await mkdir('', { baseDir: BaseDirectory.AppConfig });
    await writeTextFile('settings.json', JSON.stringify(state), {
      baseDir: BaseDirectory.AppConfig,
      create: true,
      
    });
  })
  
}


