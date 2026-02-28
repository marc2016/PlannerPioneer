import { create } from 'zustand';
import { db, initDb } from '../lib/db';
import { calculatePert } from '../lib/timeUtils';

export interface ProjectFactor {
    id: string;
    projectId: string;
    label: string;
    value: number;
}

export interface Project {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    color?: string; // Hex color code
    createdAt?: number;
    updatedAt?: number;
    moduleCount?: number;
    totalDuration?: number;
    factors?: ProjectFactor[];
}

interface ProjectState {
    projects: Project[];
    init: () => Promise<void>;
    addProject: (project: Omit<Project, 'id' | 'createdAt' | 'completed' | 'moduleCount' | 'totalDuration' | 'factors'> & { id?: string }) => Promise<void>;
    updateProject: (id: string, project: Partial<Omit<Project, 'id' | 'createdAt' | 'completed' | 'moduleCount' | 'totalDuration' | 'factors'>>) => Promise<void>;
    toggleProject: (id: string) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    addFactor: (projectId: string, label: string, value: number) => Promise<void>;
    removeFactor: (factorId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],

    init: async () => {
        await initDb();
        const projects = await db.selectFrom('projects')
            .selectAll()
            .select((eb) => [
                eb.selectFrom('modules')
                    .select(db.fn.count<number>('id').as('count'))
                    .whereRef('modules.project_id', '=', 'projects.id')
                    .as('moduleCount')
            ])
            .orderBy('created_at', 'desc')
            .execute();

        const factors = await db.selectFrom('project_factors').selectAll().execute();

        const features = await db.selectFrom('features')
            .innerJoin('modules', 'modules.id', 'features.module_id')
            .select([
                'modules.project_id',
                'features.pert_optimistic',
                'features.pert_most_likely',
                'features.pert_pessimistic'
            ])
            .execute();

        set({
            projects: projects.map(p => {
                const projectFeatures = features.filter(f => f.project_id === p.id);
                const totalDuration = projectFeatures.reduce((sum, f) => {
                    if (f.pert_most_likely !== null && f.pert_most_likely !== undefined) {
                        return sum + calculatePert(f.pert_optimistic ?? undefined, f.pert_most_likely, f.pert_pessimistic ?? undefined);
                    }
                    return sum;
                }, 0);

                return {
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    completed: Boolean(p.completed),
                    color: p.color,
                    createdAt: p.created_at,
                    updatedAt: p.updated_at,
                    moduleCount: Number(p.moduleCount || 0),
                    totalDuration: parseFloat(totalDuration.toFixed(1)),
                    factors: factors.filter(f => f.project_id === p.id).map(f => ({
                        id: f.id,
                        projectId: f.project_id,
                        label: f.label,
                        value: f.value
                    }))
                };
            })
        });
    },

    addProject: async (projectData) => {
        const newProject = {
            id: projectData.id || crypto.randomUUID(),
            title: projectData.title,
            description: projectData.description || '',
            color: projectData.color || '#2196f3',
            completed: 0,
            created_at: Date.now(),
            updated_at: Date.now()
        };

        await db.insertInto('projects')
            .values(newProject)
            .execute();

        // Reload projects to ensure sync
        await get().init();
    },

    toggleProject: async (id: string) => {
        const project = get().projects.find(p => p.id === id);
        if (!project) return;

        await db.updateTable('projects')
            .set({
                completed: project.completed ? 0 : 1,
                updated_at: Date.now()
            })
            .where('id', '=', id)
            .execute();

        await get().init();
    },

    updateProject: async (id: string, projectData: Partial<Omit<Project, 'id' | 'createdAt' | 'completed'>>) => {
        await db.updateTable('projects')
            .set({
                title: projectData.title,
                description: projectData.description,
                color: projectData.color,
                updated_at: Date.now()
            })
            .where('id', '=', id)
            .execute();

        await get().init();
    },

    deleteProject: async (id: string) => {
        await db.deleteFrom('projects')
            .where('id', '=', id)
            .execute();

        await get().init();
    },

    addFactor: async (projectId: string, label: string, value: number) => {
        await db.insertInto('project_factors')
            .values({
                id: crypto.randomUUID(),
                project_id: projectId,
                label,
                value,
                created_at: Date.now()
            })
            .execute();
        await get().init();
    },

    removeFactor: async (factorId: string) => {
        await db.deleteFrom('project_factors')
            .where('id', '=', factorId)
            .execute();
        await get().init();
    }
}));

