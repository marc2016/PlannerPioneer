import Database from '@tauri-apps/plugin-sql';
import { Kysely, Generated } from 'kysely';
import { TauriSqliteDialect } from 'kysely-dialect-tauri';

export interface ProjectsTable {
    id: Generated<string>;
    title: string;
    description: string;
    color: string;
    completed: number;
    created_at: number;
    updated_at: number;
}

export interface ModulesTable {
    id: Generated<string>;
    project_id?: string;
    title: string;
    description: string;
    color: string;
    completed: number;
    created_at: number;
    updated_at: number;
}

export interface FeaturesTable {
    id: Generated<string>;
    module_id?: string;
    title: string;
    description: string;
    color: string;
    completed: number;
    pert_optimistic?: number;
    pert_most_likely?: number;
    pert_pessimistic?: number;
    created_at: number;
    updated_at: number;
}

export interface DatabaseSchema {
    projects: ProjectsTable;
    modules: ModulesTable;
    features: FeaturesTable;
}

export const db = new Kysely<DatabaseSchema>({
    dialect: new TauriSqliteDialect({
        database: async () => await Database.load('sqlite:timetracker.db'),
    }),
});

// Init generic database
export const initDb = async () => {
    try {
        // Projects Table
        await db.schema
            .createTable('projects')
            .ifNotExists()
            .addColumn('id', 'text', (col) => col.primaryKey())
            .addColumn('title', 'text', (col) => col.notNull())
            .addColumn('description', 'text')
            .addColumn('color', 'text', (col) => col.notNull())
            .addColumn('completed', 'integer', (col) => col.notNull().defaultTo(0))
            .addColumn('created_at', 'integer', (col) => col.notNull())
            .addColumn('updated_at', 'integer', (col) => col.notNull())
            .execute();

        // Modules Table
        await db.schema
            .createTable('modules')
            .ifNotExists()
            .addColumn('id', 'text', (col) => col.primaryKey())
            .addColumn('project_id', 'text') // Optional Foreign Key
            .addColumn('title', 'text', (col) => col.notNull())
            .addColumn('description', 'text')
            .addColumn('color', 'text', (col) => col.notNull())
            .addColumn('completed', 'integer', (col) => col.notNull().defaultTo(0))
            .addColumn('created_at', 'integer', (col) => col.notNull())
            .addColumn('updated_at', 'integer', (col) => col.notNull())
            .execute();

        // Features Table
        await db.schema
            .createTable('features')
            .ifNotExists()
            .addColumn('id', 'text', (col) => col.primaryKey())
            .addColumn('module_id', 'text') // Optional Foreign Key
            .addColumn('title', 'text', (col) => col.notNull())
            .addColumn('description', 'text')
            .addColumn('color', 'text', (col) => col.notNull())
            .addColumn('completed', 'integer', (col) => col.notNull().defaultTo(0))
            .addColumn('pert_optimistic', 'real') // Optional, in hours
            .addColumn('pert_most_likely', 'real') // Required if used for est, but nullable here to support migration if needed? stick to plan: optional/required in app logic
            .addColumn('pert_pessimistic', 'real') // Optional, in hours
            .addColumn('created_at', 'integer', (col) => col.notNull())
            .addColumn('updated_at', 'integer', (col) => col.notNull())
            .execute();

        // Database Migrations regarding PERT (Safe add for existing tables)
        const addColumnIfNotExists = async (table: string, column: string, type: 'text' | 'integer' | 'real') => {
            try {
                await db.schema.alterTable(table as any).addColumn(column, type).execute();
            } catch (e) {
                // Ignore error if column already exists
            }
        };

        await addColumnIfNotExists('features', 'pert_optimistic', 'real');
        await addColumnIfNotExists('features', 'pert_most_likely', 'real');
        await addColumnIfNotExists('features', 'pert_pessimistic', 'real');

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
};
