import { create } from 'zustand';
import { db, initDb } from '../lib/db';
import { calculatePert, calculateStandardDeviation, calculateVariance } from '../lib/timeUtils';

export interface Feature {
    id: string;
    module_id?: string;
    title: string;
    description?: string;
    completed: boolean;
    color?: string; // Hex color code
    pert_optimistic?: number | null;
    pert_most_likely?: number | null;
    pert_pessimistic?: number | null;
    expected_duration?: number;
    standard_deviation?: number;
    variance?: number;
    actualDuration?: number | null;
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
                const expected = f.pert_most_likely !== undefined && f.pert_most_likely !== null
                    ? calculatePert(f.pert_optimistic ?? undefined, f.pert_most_likely, f.pert_pessimistic ?? undefined)
                    : undefined;

                const stdDev = f.pert_most_likely !== undefined && f.pert_most_likely !== null
                    ? calculateStandardDeviation(f.pert_optimistic ?? undefined, f.pert_most_likely, f.pert_pessimistic ?? undefined)
                    : undefined;
                const variance = calculateVariance(stdDev);

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
                    standard_deviation: stdDev,
                    variance: variance,
                    actualDuration: f.actual_duration,
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
            actual_duration: featureData.actualDuration,
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
        const updatePayload: any = {
            title: featureData.title,
            description: featureData.description,
            color: featureData.color,
            updated_at: Date.now()
        };

        if (featureData.module_id !== undefined) updatePayload.module_id = featureData.module_id;
        if (featureData.pert_optimistic !== undefined) updatePayload.pert_optimistic = featureData.pert_optimistic;
        if (featureData.pert_most_likely !== undefined) updatePayload.pert_most_likely = featureData.pert_most_likely;
        if (featureData.pert_pessimistic !== undefined) updatePayload.pert_pessimistic = featureData.pert_pessimistic;
        if (featureData.actualDuration !== undefined) updatePayload.actual_duration = featureData.actualDuration;

        await db.updateTable('features')
            .set(updatePayload)
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
