import { create } from 'zustand';
import { BaseDirectory, exists, mkdir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

interface SettingsState {
    appBackground: string;
    selectedProjectId: string;
    ganttViewMode: string;
    setAppBackground: (path: string) => void;
    setSelectedProjectId: (id: string) => void;
    setGanttViewMode: (mode: string) => void;
    init: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    appBackground: '', // Default to empty or a specific default path
    selectedProjectId: 'all',
    ganttViewMode: 'Month', // Default view mode
    setAppBackground: async (path: string) => {
        set({ appBackground: path });
        // Auto-save on change
        try {
            console.log('Attempting to save settings...', path);
            if (!await exists('', { baseDir: BaseDirectory.AppConfig })) {
                console.log('AppConfig directory does not exist, creating...');
                await mkdir('', { baseDir: BaseDirectory.AppConfig });
            }
            const currentSelected = get().selectedProjectId;
            const currentGanttViewMode = get().ganttViewMode;
            await writeTextFile('settings.json', JSON.stringify({ appBackground: path, selectedProjectId: currentSelected, ganttViewMode: currentGanttViewMode }), {
                baseDir: BaseDirectory.AppConfig,
                create: true,
            });
            console.log('Settings saved successfully.');
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    },
    setSelectedProjectId: async (id: string) => {
        set({ selectedProjectId: id });
        try {
            console.log('Attempting to save selected project...', id);
            if (!await exists('', { baseDir: BaseDirectory.AppConfig })) {
                await mkdir('', { baseDir: BaseDirectory.AppConfig });
            }
            const currentBg = get().appBackground;
            const currentGanttViewMode = get().ganttViewMode;
            await writeTextFile('settings.json', JSON.stringify({ appBackground: currentBg, selectedProjectId: id, ganttViewMode: currentGanttViewMode }), {
                baseDir: BaseDirectory.AppConfig,
                create: true,
            });
            console.log('Selected project saved successfully.');
        } catch (error) {
            console.error('Failed to save selected project:', error);
        }
    },
    setGanttViewMode: async (mode: string) => {
        set({ ganttViewMode: mode });
        try {
            console.log('Attempting to save gantt view mode...', mode);
            if (!await exists('', { baseDir: BaseDirectory.AppConfig })) {
                await mkdir('', { baseDir: BaseDirectory.AppConfig });
            }
            const currentBg = get().appBackground;
            const currentSelected = get().selectedProjectId;
            await writeTextFile('settings.json', JSON.stringify({ appBackground: currentBg, selectedProjectId: currentSelected, ganttViewMode: mode }), {
                baseDir: BaseDirectory.AppConfig,
                create: true,
            });
            console.log('Gantt view mode saved successfully.');
        } catch (error) {
            console.error('Failed to save gantt view mode:', error);
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
                if (settings.selectedProjectId) {
                    set({ selectedProjectId: settings.selectedProjectId });
                }
                if (settings.ganttViewMode) {
                    set({ ganttViewMode: settings.ganttViewMode });
                }
            } else {
                console.log('No settings file found.');
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    },
}));
