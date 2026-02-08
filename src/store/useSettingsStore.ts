import { create } from 'zustand';
import { BaseDirectory, exists, mkdir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

interface SettingsState {
    appBackground: string;
    setAppBackground: (path: string) => void;
    init: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    appBackground: '', // Default to empty or a specific default path
    setAppBackground: async (path: string) => {
        set({ appBackground: path });
        // Auto-save on change
        try {
            console.log('Attempting to save settings...', path);
            if (!await exists('', { baseDir: BaseDirectory.AppConfig })) {
                console.log('AppConfig directory does not exist, creating...');
                await mkdir('', { baseDir: BaseDirectory.AppConfig });
            }
            await writeTextFile('settings.json', JSON.stringify({ appBackground: path }), {
                baseDir: BaseDirectory.AppConfig,
                create: true,
            });
            console.log('Settings saved successfully.');
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    },
    init: async () => {
        try {
            console.log('Initializing settings...');
            if (await exists('settings.json', { baseDir: BaseDirectory.AppConfig })) {
                const settingsText = await readTextFile('settings.json', {
                    baseDir: BaseDirectory.AppConfig,
                });
                console.log('Settings loaded:', settingsText);
                const settings = JSON.parse(settingsText);
                if (settings.appBackground) {
                    set({ appBackground: settings.appBackground });
                }
            } else {
                console.log('No settings file found.');
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    },
}));
