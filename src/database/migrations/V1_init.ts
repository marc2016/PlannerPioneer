import { Kysely, sql } from 'kysely'
import { NamedMigration } from '../Migrations'

const migration: NamedMigration = {
  name: "V1_init",

  up: async (db: Kysely<any>): Promise<void> =>{
    await db.schema
      .createTable('person')
      .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('createdAt', 'datetime', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .addColumn('updatedAt', 'datetime', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .execute()
    await db.schema
      .createTable('sprint')
      .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('startDate', 'datetime', (col) => col.notNull())
      .addColumn('endDate', 'datetime', (col) => col.notNull())
      .addColumn('createdAt', 'datetime', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .addColumn('updatedAt', 'datetime', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .execute()
    await db.schema
      .createTable('task')
      .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('description', 'text')
      .addColumn('done', 'boolean', (col) => col.notNull())
      .addColumn('sprintId', 'integer')
      .addColumn('createdAt', 'datetime', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .addColumn('updatedAt', 'datetime', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
      .execute()
    await db.schema
      .createTable('personToTask')
      .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
      .addColumn('taskId', 'integer', (col) => col.notNull())
      .addColumn('personId', 'integer', (col) => col.notNull())
      .execute()
  },
  down: async (db: Kysely<any>): Promise<void> => {
    await db.schema.dropTable('person').execute()
    await db.schema.dropTable('sprint').execute()
    await db.schema.dropTable('task').execute()
    await db.schema.dropTable('personToTask').execute()
  }
}

export default migration