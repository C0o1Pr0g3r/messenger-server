import type { z } from "zod";

import { Chat, User } from "~/domain";

const zIn = Chat.zBaseSchema
  .pick({
    id: true,
  })
  .extend({
    initiatorId: User.zSchema.shape.id,
  });
type In = z.infer<typeof zIn>;

export { zIn };
export type { In };
