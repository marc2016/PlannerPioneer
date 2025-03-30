import { ColumnType, Generated, Insertable, Selectable, Updateable } from "kysely"

export interface TaskDatabase {
  task: TaskTable
}

export interface TaskTable {
  id: Generated<bigint>
  name: string
  description: string
  done: boolean
  createdAt: Date
  updatedAt: Date
}

export type Task = Selectable<TaskTable>
export type NewTask = Insertable<TaskTable>
export type TaskUpdate = Updateable<TaskTable>
