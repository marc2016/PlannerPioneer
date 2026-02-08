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

export interface DatabaseSchema {
    projects: ProjectsTable;
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

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
};
