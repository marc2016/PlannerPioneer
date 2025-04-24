import database from "../database/Database";
import { Sprint } from "../database/Types";

export class SprintRepository {
  async getAllSprints(): Promise<Sprint[]> {
    const sprints = await database
      .selectFrom("sprint")
      .selectAll()
      .execute();
    
    if(!sprints)
      return [];
    return sprints;
  }

  async getSprintById(id: number): Promise<any> {
    const sprint = await database
      .selectFrom("sprint")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
    
    if(!sprint)
      return null;
    return sprint;
  }
}