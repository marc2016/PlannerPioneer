import { Kysely, sql } from 'kysely'
import { NamedMigration } from '../Migrations'

const migration: NamedMigration = {
  name: "taskV1",

  up: async (db: Kysely<any>): Promise<void> =>{
  await db.schema
    .createTable('task')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('done', 'boolean', (col) => col.notNull())
    .addColumn('createdAt', 'datetime', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updatedAt', 'datetime', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute()
  },
  down: async (db: Kysely<any>): Promise<void> => {
    await db.schema.dropTable('task').execute()
  }
}

export default migration