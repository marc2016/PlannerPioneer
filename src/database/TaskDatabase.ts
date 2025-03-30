import { appDataDir } from '@tauri-apps/api/path'
import Database from '@tauri-apps/plugin-sql'
import { Kysely } from 'kysely'
import { TauriSqliteDialect } from 'kysely-dialect-tauri';

import { TaskDatabase, TaskTable } from './TaskTypes';
import { SqliteTypePlugin } from './plugins/SqlitePlugin';

const appData = await appDataDir();
const dialect = new TauriSqliteDialect({
  database: async prefix => Database.load(`${prefix}${appData}/task.db`),
  
})

const taskExample: TaskTable = {
  name: '',
  description: '',
  done: false,
  id: {
    __select__: 0n,
    __insert__: undefined,
    __update__: 0n
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

const taskDb = new Kysely<TaskDatabase>({
  dialect,
  plugins: [
    new SqliteTypePlugin(taskExample)
  ]
})

export default taskDb
