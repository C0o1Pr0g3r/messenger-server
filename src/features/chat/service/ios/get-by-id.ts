import type { z } from "zod";

import { Chat } from "~/domain";

const zIn = Chat.zBaseSchema.pick({
  id: true,
});
type In = z.infer<typeof zIn>;

export { zIn };
export type { In };
