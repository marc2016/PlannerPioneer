import { Generated, Insertable, Selectable, Updateable } from "kysely"

export interface PlannerPioneerDatabase {
  person: PersonTable,
  sprint: SprintTable,
  task: TaskTable,
  personToTask: PersonToTaskTable
}

export interface PersonTable {
  id: Generated<bigint> | undefined 
  name: string
  createdAt: Date
  updatedAt: Date
}

export type PersonDb = Selectable<PersonTable>
export type NewPersonDb = Insertable<PersonTable>
export type PersonUpdateDb = Updateable<PersonTable>

export interface SprintTable {
  id: Generated<bigint> | undefined,
  name: string,
  startDate: Date,
  endDate: Date,
  tasks: Task[] | undefined,
  createdAt: Date,
  updatedAt: Date,
  dateOverlapping: boolean | undefined,
}

export type Sprint = Selectable<SprintTable>
export type NewSprint = Insertable<SprintTable>
export type SprintUpdate = Updateable<SprintTable>

export interface TaskTable {
  id: Generated<bigint> | undefined,
  name: string,
  description: string,
  done: boolean
  sprintId: number,
  createdAt: Date,
  updatedAt: Date,
  persons: PersonDb[] | undefined,
}

export type Task = Selectable<TaskTable>
export type NewTask = Insertable<TaskTable>
export type TaskUpdate = Updateable<TaskTable>

export interface PersonToTaskTable {
  id: Generated<bigint> | undefined,
  taskId: bigint,
  personId: bigint,
}

export type PersonToTask = Selectable<PersonToTaskTable>
export type NewPersonToTask = Insertable<PersonToTaskTable>
export type PersonToTaskUpdate = Updateable<PersonToTaskTable>