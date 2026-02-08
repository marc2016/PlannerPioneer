import { create } from 'zustand';
import { db, initDb } from '../lib/db';

export interface Project {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    color?: string; // Hex color code
    createdAt?: number;
}

interface ProjectState {
    projects: Project[];
    init: () => Promise<void>;
    addProject: (project: Omit<Project, 'id' | 'createdAt' | 'completed'> & { id?: string }) => Promise<void>;
    updateProject: (id: string, project: Partial<Omit<Project, 'id' | 'createdAt' | 'completed'>>) => Promise<void>;
    toggleProject: (id: string) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],

    init: async () => {
        await initDb();
        const projects = await db.selectFrom('projects')
            .selectAll()
            .orderBy('created_at', 'desc')
            .execute();

        set({
            projects: projects.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                completed: Boolean(p.completed),
                color: p.color,
                createdAt: p.created_at
            }))
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
    }
}));

