import type { z } from "zod";

import { User } from "~/domain";

const zOut = User.zSchema.omit({
  password: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
type Out = z.infer<typeof zOut>;

export { zOut };
export type { Out };
