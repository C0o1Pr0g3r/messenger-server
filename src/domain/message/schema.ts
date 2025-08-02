import z from "zod";

import { zLifeCycleDates } from "../life-cycle-dates";

const zSchema = zLifeCycleDates.extend({
  id: z.number().int(),
  text: z.string().trim().nonempty(),
});
type Schema = z.infer<typeof zSchema>;

export { zSchema };
export type { Schema };
