import type { Migration, MigrationProvider } from "kysely";
import { migrations } from "./Migrations";

export class CustomMigrationProvider implements MigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    return migrations;
  }
}