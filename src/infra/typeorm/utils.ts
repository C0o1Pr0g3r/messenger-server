import type { ColumnOptions } from "typeorm";
import { z } from "zod";

import { Zod } from "../../common";

function toColumnOptions<
  T extends z.ZodString | z.ZodNumber | z.ZodBoolean | z.ZodEnum | z.ZodNullable | z.ZodEmail,
>(type: T): ColumnOptions {
  const type_ = type instanceof z.ZodNullable ? type.unwrap() : type;
  const nullable = type instanceof z.ZodNullable;

  if (type_ instanceof z.ZodString || type_ instanceof z.ZodEmail) {
    return {
      type: "text",
      nullable,
    };
  } else if (type_ instanceof z.ZodNumber) {
    return {
      type: Zod.isInt(type_) ? "int" : "real",
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
      enum: type_.options,
      nullable,
    };
  }

  throw new Error(
    `There is no corresponding column type for zod type "${(type as z.ZodType).def.type}".`,
  );
}

export { toColumnOptions };
