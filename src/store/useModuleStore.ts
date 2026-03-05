import { create } from 'zustand';
import { db, initDb } from '../lib/db';

export interface Module {
    id: string;
    project_id?: string;
    title: string;
    description?: string;
    completed: boolean;
    color?: string; // Hex color code
    tShirtSize?: 'S' | 'M' | 'L' | 'XL';
    createdAt?: number;
    updatedAt?: number;
    totalDuration?: number;
}

interface ModuleState {
    modules: Module[];
    init: () => Promise<void>;
    addModule: (module: Omit<Module, 'id' | 'createdAt' | 'completed' | 'totalDuration'> & { id?: string }) => Promise<void>;
    updateModule: (id: string, module: Partial<Omit<Module, 'id' | 'createdAt' | 'completed' | 'totalDuration'>>) => Promise<void>;
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

        const features = await db.selectFrom('features')
            .select(['module_id', 'pert_optimistic', 'pert_most_likely', 'pert_pessimistic'])
            .execute();

        const { calculatePert } = await import('../lib/timeUtils');

        set({
            modules: modules.map(m => {
                const moduleFeatures = features.filter(f => f.module_id === m.id);
                const totalDuration = moduleFeatures.reduce((sum, f) => {
                    if (f.pert_most_likely !== null && f.pert_most_likely !== undefined) {
                        return sum + calculatePert(f.pert_optimistic ?? undefined, f.pert_most_likely, f.pert_pessimistic ?? undefined);
                    }
                    return sum;
                }, 0);

                return {
                    id: m.id,
                    project_id: m.project_id || undefined,
                    title: m.title,
                    description: m.description || undefined,
                    completed: Boolean(m.completed),
                    color: m.color,
                    tShirtSize: m.t_shirt_size as 'S' | 'M' | 'L' | 'XL' | undefined,
                    createdAt: m.created_at,
                    updatedAt: m.updated_at,
                    totalDuration: parseFloat(totalDuration.toFixed(1))
                };
            })
        });
    },

    addModule: async (moduleData) => {
        const newModule = {
            id: moduleData.id || crypto.randomUUID(),
            project_id: moduleData.project_id || undefined,
            title: moduleData.title,
            description: moduleData.description || '',
            color: moduleData.color || '#F44336', // Default red-ish
            t_shirt_size: moduleData.tShirtSize || undefined,
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
                t_shirt_size: moduleData.tShirtSize,
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
