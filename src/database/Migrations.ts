import { type Migration } from "kysely";
import V1_init from "./migrations/V1_init";

export type NamedMigration = Migration & {
  name: string;
}

export const migrations: Record<string, Migration> = {
  [V1_init.name]: {
    up: V1_init.up,
    down: V1_init.down,
  },
};