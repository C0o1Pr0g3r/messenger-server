import { z } from "zod";

const zLifeCycleDates = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});
type LifeCycleDates = z.infer<typeof zLifeCycleDates>;

export { zLifeCycleDates };
export type { LifeCycleDates };
