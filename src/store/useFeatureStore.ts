import { create } from 'zustand';
import { db, initDb } from '../lib/db';
import { calculatePert } from '../lib/timeUtils';

export interface Feature {
    id: string;
    module_id?: string;
    title: string;
    description?: string;
    completed: boolean;
    color?: string; // Hex color code
    pert_optimistic?: number;
    pert_most_likely?: number;
    pert_pessimistic?: number;
    expected_duration?: number;
    createdAt?: number;
}

interface FeatureState {
    features: Feature[];
    init: () => Promise<void>;
    addFeature: (feature: Omit<Feature, 'id' | 'createdAt' | 'completed' | 'expected_duration'> & { id?: string }) => Promise<void>;
    updateFeature: (id: string, feature: Partial<Omit<Feature, 'id' | 'createdAt' | 'completed' | 'expected_duration'>>) => Promise<void>;
    toggleFeature: (id: string) => Promise<void>;
    deleteFeature: (id: string) => Promise<void>;
}

export const useFeatureStore = create<FeatureState>((set, get) => ({
    features: [],

    init: async () => {
        await initDb();
        const features = await db.selectFrom('features')
            .selectAll()
            .orderBy('created_at', 'desc')
            .execute();

        set({
            features: features.map(f => {
                const expected = f.pert_most_likely
                    ? calculatePert(f.pert_optimistic, f.pert_most_likely, f.pert_pessimistic)
                    : undefined;

                return {
                    id: f.id,
                    module_id: f.module_id || undefined,
                    title: f.title,
                    description: f.description || undefined,
                    completed: Boolean(f.completed),
                    color: f.color,
                    pert_optimistic: f.pert_optimistic,
                    pert_most_likely: f.pert_most_likely,
                    pert_pessimistic: f.pert_pessimistic,
                    expected_duration: expected,
                    createdAt: f.created_at
                };
            })
        });
    },

    addFeature: async (featureData) => {
        const newFeature = {
            id: featureData.id || crypto.randomUUID(),
            module_id: featureData.module_id || undefined,
            title: featureData.title,
            description: featureData.description || '',
            color: featureData.color || '#9C27B0', // Default purple-ish
            completed: 0,
            pert_optimistic: featureData.pert_optimistic,
            pert_most_likely: featureData.pert_most_likely,
            pert_pessimistic: featureData.pert_pessimistic,
            created_at: Date.now(),
            updated_at: Date.now()
        };

        await db.insertInto('features')
            .values(newFeature)
            .execute();

        // Reload features to ensure sync
        await get().init();
    },

    toggleFeature: async (id: string) => {
        const feature = get().features.find(f => f.id === id);
        if (!feature) return;

        await db.updateTable('features')
            .set({
                completed: feature.completed ? 0 : 1,
                updated_at: Date.now()
            })
            .where('id', '=', id)
            .execute();

        await get().init();
    },

    updateFeature: async (id: string, featureData: Partial<Omit<Feature, 'id' | 'createdAt' | 'completed' | 'expected_duration'>>) => {
        await db.updateTable('features')
            .set({
                module_id: featureData.module_id || undefined,
                title: featureData.title,
                description: featureData.description,
                color: featureData.color,
                pert_optimistic: featureData.pert_optimistic,
                pert_most_likely: featureData.pert_most_likely,
                pert_pessimistic: featureData.pert_pessimistic,
                updated_at: Date.now()
            })
            .where('id', '=', id)
            .execute();

        await get().init();
    },

    deleteFeature: async (id: string) => {
        await db.deleteFrom('features')
            .where('id', '=', id)
            .execute();

        await get().init();
    }
}));
