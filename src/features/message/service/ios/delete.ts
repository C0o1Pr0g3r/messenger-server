import type { z } from "zod";

import { Message, User } from "~/domain";

const zIn = Message.zOriginalSchema
  .pick({
    id: true,
  })
  .extend({
    [Message.DISCRIMINATOR]: Message.Attribute.OriginType.zSchema,
    initiatorId: User.zSchema.shape.id,
  });
type In = z.infer<typeof zIn>;

export { zIn };
export type { In };
