import { Generated, Insertable, Selectable, Updateable } from "kysely"

export interface PlannerPioneerDatabase {
  person: PersonTable
}

export interface PersonTable {
  id: Generated<bigint> | undefined 
  name: string
  createdAt: Date
  updatedAt: Date
}

export type Person = Selectable<PersonTable>
export type NewPerson = Insertable<PersonTable>
export type PersonUpdate = Updateable<PersonTable>
