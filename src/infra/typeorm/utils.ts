import type { ColumnOptions, QueryRunner } from "typeorm";
import { z } from "zod";

function toColumnOptions<
  T extends
    | z.ZodString
    | z.ZodNumber
    | z.ZodBoolean
    | z.ZodEnum<[string, ...string[]]>
    | z.ZodNullable<z.ZodTypeAny>,
>(type: T): ColumnOptions {
  const type_ = type instanceof z.ZodNullable ? type.unwrap() : type;
  const nullable = type instanceof z.ZodNullable;

  if (type_ instanceof z.ZodString) {
    return {
      type: "text",
      nullable,
    };
  } else if (type_ instanceof z.ZodNumber) {
    return {
      type: type_.isInt ? "int" : "real",
      nullable,
    };
  } else if (type_ instanceof z.ZodBoolean) {
    return {
      type: "bool",
      nullable,
    };
  } else if (type_ instanceof z.ZodEnum) {
    return {
      type: "enum",
      enum: (type_ as z.ZodEnum<[string, ...string[]]>).options,
      nullable,
    };
  }

  throw new Error(`There is no corresponding column type for zod type "${type._def.typeName}".`);
}

function getBoundSql(queryRunner: QueryRunner) {
  return queryRunner.sql.bind(queryRunner);
}

const SYMBOLS = ["%", "_"];

function escapeLikeArgument(value: string) {
  let escapedValue = value;
  for (const symbol of SYMBOLS) {
    escapedValue = escapedValue.replaceAll(symbol, `\\${symbol}`);
  }
  return escapedValue;
}

export { escapeLikeArgument, getBoundSql, toColumnOptions };
