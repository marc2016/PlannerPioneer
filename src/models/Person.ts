import { PersonDb } from "../database/Types";

export class Person {
  id: number | null;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: number | null, name: string, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static fromDb(person: PersonDb): Person {
    return new Person(
      person.id !== null ? Number(person.id) : null,
      person.name,
      person.createdAt,
      person.updatedAt
    );
  }
}