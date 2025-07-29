import type { z } from "zod";

function isInt(schema: z.ZodNumber) {
  return schema.format === "safeint";
}

export { isInt };
