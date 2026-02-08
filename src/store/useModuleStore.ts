import { create } from 'zustand';
import { db, initDb } from '../lib/db';

export interface Module {
    id: string;
    project_id?: string;
    title: string;
    description?: string;
    completed: boolean;
    color?: string; // Hex color code
    createdAt?: number;
}

interface ModuleState {
    modules: Module[];
    init: () => Promise<void>;
    addModule: (module: Omit<Module, 'id' | 'createdAt' | 'completed'> & { id?: string }) => Promise<void>;
    updateModule: (id: string, module: Partial<Omit<Module, 'id' | 'createdAt' | 'completed'>>) => Promise<void>;
    toggleModule: (id: string) => Promise<void>;
    deleteModule: (id: string) => Promise<void>;
}

export const useModuleStore = create<ModuleState>((set, get) => ({
    modules: [],

    init: async () => {
        await initDb();
        const modules = await db.selectFrom('modules')
            .selectAll()
            .orderBy('created_at', 'desc')
            .execute();

        set({
            modules: modules.map(m => ({
                id: m.id,
                project_id: m.project_id || undefined,
                title: m.title,
                description: m.description || undefined,
                completed: Boolean(m.completed),
                color: m.color,
                createdAt: m.created_at
            }))
        });
    },

    addModule: async (moduleData) => {
        const newModule = {
            id: moduleData.id || crypto.randomUUID(),
            project_id: moduleData.project_id || undefined,
            title: moduleData.title,
            description: moduleData.description || '',
            color: moduleData.color || '#F44336', // Default red-ish
            completed: 0,
            created_at: Date.now(),
            updated_at: Date.now()
        };

        await db.insertInto('modules')
            .values(newModule)
            .execute();

        // Reload modules to ensure sync
        await get().init();
    },

    toggleModule: async (id: string) => {
        const module = get().modules.find(m => m.id === id);
        if (!module) return;

        await db.updateTable('modules')
            .set({
                completed: module.completed ? 0 : 1,
                updated_at: Date.now()
            })
            .where('id', '=', id)
            .execute();

        await get().init();
    },

    updateModule: async (id: string, moduleData: Partial<Omit<Module, 'id' | 'createdAt' | 'completed'>>) => {
        await db.updateTable('modules')
            .set({
                project_id: moduleData.project_id || undefined,
                title: moduleData.title,
                description: moduleData.description,
                color: moduleData.color,
                updated_at: Date.now()
            })
            .where('id', '=', id)
            .execute();

        await get().init();
    },

    deleteModule: async (id: string) => {
        await db.deleteFrom('modules')
            .where('id', '=', id)
            .execute();

        await get().init();
    }
}));
