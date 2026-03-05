import { db } from './db';

export const exportProjectData = async (projectId: string) => {
    const project = await db.selectFrom('projects').where('id', '=', projectId).selectAll().executeTakeFirst();
    if (!project) throw new Error("Project not found");

    const factors = await db.selectFrom('project_factors').where('project_id', '=', projectId).selectAll().execute();

    const modules = await db.selectFrom('modules').where('project_id', '=', projectId).selectAll().execute();

    const moduleIds = modules.map(m => m.id);
    let features: any[] = [];
    if (moduleIds.length > 0) {
        features = await db.selectFrom('features').where('module_id', 'in', moduleIds).selectAll().execute();
    }

    const payload = {
        version: 1,
        plannerPioneerExport: true,
        data: {
            project,
            factors,
            modules,
            features
        }
    };

    return JSON.stringify(payload, null, 2);
};

export const importProjectData = async (jsonData: any) => {
    if (!jsonData.plannerPioneerExport) {
        throw new Error("Invalid import file format");
    }

    const { project, factors, modules, features } = jsonData.data;

    const newProjectId = crypto.randomUUID();

    const newProject = {
        ...project,
        id: newProjectId,
        created_at: Date.now(),
        updated_at: Date.now()
    };

    const newFactors = (factors || []).map((f: any) => ({
        ...f,
        id: crypto.randomUUID(),
        project_id: newProjectId,
        created_at: Date.now()
    }));

    const moduleIdMap = new Map<string, string>();
    const newModules = (modules || []).map((m: any) => {
        const newId = crypto.randomUUID();
        moduleIdMap.set(m.id, newId);
        return {
            ...m,
            id: newId,
            project_id: newProjectId,
            created_at: Date.now(),
            updated_at: Date.now()
        };
    });

    const newFeatures = (features || []).map((f: any) => ({
        ...f,
        id: crypto.randomUUID(),
        module_id: f.module_id && moduleIdMap.has(f.module_id) ? moduleIdMap.get(f.module_id) : null,
        created_at: Date.now(),
        updated_at: Date.now()
    }));

    await db.insertInto('projects').values(newProject).execute();

    if (newFactors.length > 0) {
        await db.insertInto('project_factors').values(newFactors).execute();
    }

    if (newModules.length > 0) {
        await db.insertInto('modules').values(newModules).execute();
    }

    if (newFeatures.length > 0) {
        await db.insertInto('features').values(newFeatures).execute();
    }

    return newProjectId;
};
