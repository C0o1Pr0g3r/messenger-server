import type z from "zod";

import { User } from "~/domain";

const zIn = User.zSchema.pick({
  email: true,
  password: true,
});
type In = z.infer<typeof zIn>;

export { zIn };
export type { In };
