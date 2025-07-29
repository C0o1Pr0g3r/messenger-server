import { z } from "zod";

const zSchema = z.enum(["dialogue", "polylogue"]);
const Schema = zSchema.enum;
type Schema = z.infer<typeof zSchema>;

export { Schema, zSchema };
