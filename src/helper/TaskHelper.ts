import { TaskTable } from "../database/TaskTypes";

function hasTaskChanged(task1: TaskTable, task2: TaskTable): boolean {
  return task1.name !== task2.name || task1.description !== task2.description || task1.done !== task2.done
}

export { hasTaskChanged };