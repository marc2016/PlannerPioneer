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
            .addColumn('created_at', 'integer', (col) => col.notNull())
            .addColumn('updated_at', 'integer', (col) => col.notNull())
            .execute();

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
};
