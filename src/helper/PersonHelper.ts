import { Person } from "../database/Types";

function hasPersonChanged(person1: Person, person2: Person): boolean {
  return person1.name !== person2.name
}

export { hasPersonChanged};