import database from "../database/Database";
import { Task } from "../database/Types";

export class TaskRepository {
  
  private async setPersonsForTasks(tasks: Task[]): Promise<Task[]> {
    const taskIds = tasks.map(task => task.id).filter(id => { return id != undefined })
    const personIdsForTasks = await database
      .selectFrom("personToTask")
      .selectAll()
      .where("taskId", "in", taskIds)
      .execute();

    const persons = await database
      .selectFrom("person")
      .selectAll()
      .where("id", "in", personIdsForTasks.map(person => person.personId))
      .execute();

    tasks.forEach(task => {
      task.persons = persons.filter(person => {
        return personIdsForTasks.find(personToTask => {
          return personToTask.taskId === task.id && personToTask.personId === person.id
        })
      })
    })
    return tasks;
  }

  async getAllTasks(): Promise<Task[]> {
    const tasks = await database
      .selectFrom("task")
      .selectAll()
      .execute();
    
    if(!tasks)
      return [];
    const tasksWithPersons = this.setPersonsForTasks(tasks);
    return tasksWithPersons;
  }

  async getTasksForSprint(id: number): Promise<Task[]> {
    const tasks = await database
      .selectFrom("task")
      .selectAll()
      .where("sprintId", "=", id)
      .execute();
    
    if(!tasks)
      return [];
    const tasksWithPersons = this.setPersonsForTasks(tasks);
    return tasksWithPersons;
  }
}