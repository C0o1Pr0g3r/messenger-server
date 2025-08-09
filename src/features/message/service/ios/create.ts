import type { z } from "zod";

import { Chat, Message, User } from "~/domain";

const zIn = Message.zOriginalSchema
  .pick({
    text: true,
  })
  .extend({
    authorId: User.zSchema.shape.id,
    chatId: Chat.zBaseSchema.shape.id,
  });
type In = z.infer<typeof zIn>;

export { zIn };
export type { In };
