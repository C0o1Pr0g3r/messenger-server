import z from "zod";

import { zLifeCycleDates } from "../life-cycle-dates";

import { Type } from "./attributes";

const zSchema = zLifeCycleDates.extend({
  id: z.number().int(),
  name: z.string().trim().nonempty(),
  link: z.string().trim().nonempty(),
  type: Type.zSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});
type Schema = z.infer<typeof zSchema>;

export { zSchema };
export type { Schema };
