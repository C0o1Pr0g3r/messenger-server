import type { z } from "zod";

import { Message, User } from "~/domain";

const zIn = Message.zBaseSchema
  .pick({
    id: true,
  })
  .extend({
    [Message.DISCRIMINATOR]: Message.Attribute.OriginType.zSchema,
    userId: User.zSchema.shape.id,
  });
type In = z.infer<typeof zIn>;

export { zIn };
export type { In };
