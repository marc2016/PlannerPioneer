import { type Migration } from "kysely";
import taskV1 from "./migrations/taskV1";

export type NamedMigration = Migration & {
  name: string;
}

export const migrations: Record<string, Migration> = {
  [taskV1.name]: {
    up: taskV1.up,
    down: taskV1.down,
  },
};