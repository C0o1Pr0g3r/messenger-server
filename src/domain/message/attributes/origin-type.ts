import { z } from "zod";

const zSchema = z.enum(["original", "forwarded"]);
const Schema = zSchema.enum;
type Schema = z.infer<typeof zSchema>;

export { Schema, zSchema };
