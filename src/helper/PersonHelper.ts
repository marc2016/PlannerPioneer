import { PersonDb } from "../database/Types";

function hasPersonChanged(person1: PersonDb, person2: PersonDb): boolean {
  return person1.name !== person2.name
}

export { hasPersonChanged};