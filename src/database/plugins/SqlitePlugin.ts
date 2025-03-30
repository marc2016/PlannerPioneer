import {
  KyselyPlugin,
  OperationNodeTransformer,
  PluginTransformQueryArgs,
  PluginTransformResultArgs,
  QueryResult,
  RootOperationNode,
  UnknownRow,
  ValueNode,
} from "kysely";

export class SqliteTypePlugin<T extends Record<string, any>> implements KyselyPlugin {
  private booleanColumns: (keyof T)[];
  private dateColumns: (keyof T)[];

  constructor(type: T) {
    // Automatically determine boolean and date columns based on the type
    this.booleanColumns = Object.keys(type).filter(
      (key) => typeof type[key as keyof T] === "boolean"
    ) as (keyof T)[];

    this.dateColumns = Object.keys(type).filter(
      (key) => type[key as keyof T] != null && typeof type[key as keyof T] === "object" && (type[key as keyof T] as unknown) instanceof Date
    ) as (keyof T)[];
  }

  readonly transformer = new SqliteTypeTransformer();

  transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
    return this.transformer.transformNode(args.node);
  }

  transformResult(
    args: PluginTransformResultArgs
  ): Promise<QueryResult<UnknownRow>> {
    for (const row of args.result.rows) {
      // Convert boolean columns
      for (const column of this.booleanColumns) {
        if (column in row) {
          (row as Record<string, any>)[column as string] = Boolean(row[column as string]);
        }
      }

      // Convert date columns
      for (const column of this.dateColumns) {
        if (column in row) {
          const value = row[column as string];
          (row as Record<string, any>)[column as string] =
            typeof value === "string" || typeof value === "number" ? new Date(value) : value;
        }
      }
    }

    return Promise.resolve(args.result);
  }
}

class SqliteTypeTransformer extends OperationNodeTransformer {
  transformValue(node: ValueNode): ValueNode {
    return {
      ...super.transformValue(node),
      value:
        typeof node.value === "boolean"
          ? (node.value ? 1 : 0)
          : node.value instanceof Date
          ? node.value.toISOString()
          : node.value,
    };
  }
}