import database from "../database/Database";
import { Person } from "../models/Person";

export class PersonRepository {
  async getAll(): Promise<Person[]> {
    const personsFromDb = await database
      .selectFrom("person")
      .selectAll()
      .execute();
    
    if(!personsFromDb)
      return [];
    const persons = personsFromDb.map(person => Person.fromDb(person));
    return persons;
  }

  async getById(id: number): Promise<Person | null> {
    const personFromDb = await database
      .selectFrom("person")
      .selectAll()
      .where("id", "=", id as any)
      .executeTakeFirst();
    
    if(!personFromDb)
      return null;
    return Person.fromDb(personFromDb);
  }

  async delete(person: Person): Promise<Person | null> {
    const personFromDb = await database
      .deleteFrom("person")
      .where("id", "=", person.id as any)
      .returningAll()
      .executeTakeFirst();
    
    if(!personFromDb)
      return null;
    return Person.fromDb(personFromDb);

  }

  async createOrUpdate(person: Person): Promise<Person> {
    if(person.id) {
      const updatedPerson = await this.update(person);
      if(!updatedPerson)
        throw new Error("Error updating person");
      return updatedPerson;
    } else {
      const createdPerson = await this.create(person.name);
      return createdPerson;
    }

  }

  async create(name: string): Promise<Person> {
    const personFromDb = await database
      .insertInto("person")
      .values({
        name: name,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    
    return Person.fromDb(personFromDb);
  }

  async update(person: Person): Promise<Person | null> {
    const personFromDb = await database
      .updateTable("person")
      .set({
        name: person.name,
        // updatedAt: new Date(),
      })
      .where("id", "=", person.id as any)
      .returningAll()
      .executeTakeFirst();
    
    if(!personFromDb)
      return null;
    return Person.fromDb(personFromDb);
  }
}