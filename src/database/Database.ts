import { appDataDir } from '@tauri-apps/api/path'
import Database from '@tauri-apps/plugin-sql'
import { Kysely } from 'kysely'
import { TauriSqliteDialect } from 'kysely-dialect-tauri';

import { SqliteTypePlugin } from './plugins/SqlitePlugin';
import { PlannerPioneerDatabase, PersonTable } from './Types';

const appData = await appDataDir();
const dialect = new TauriSqliteDialect({
  database: async prefix => Database.load(`${prefix}${appData}/PlannerPioneer.db`),
  
})

const personExample: PersonTable = {
  name: '',
  id: {
    __select__: 0n,
    __insert__: undefined,
    __update__: 0n
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

const blub = {
  name: '',
}

const database = new Kysely<PlannerPioneerDatabase>({
  dialect,
  plugins: [
    new SqliteTypePlugin([personExample, blub])
  ]
})

export default database
