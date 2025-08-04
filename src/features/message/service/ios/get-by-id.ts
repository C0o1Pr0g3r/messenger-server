import type { z } from "zod";

import { Message } from "~/domain";

const zIn = Message.zSchema.pick({
  id: true,
});
type In = z.infer<typeof zIn>;

export { zIn };
export type { In };
