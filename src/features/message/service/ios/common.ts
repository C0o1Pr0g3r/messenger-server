import type { z } from "zod";

import { Chat, Message, User } from "~/domain";

const zOut = Message.zSchema
  .pick({
    id: true,
    text: true,
    createdAt: true,
  })
  .extend({
    authorId: User.zSchema.shape.id,
    chatId: Chat.zBaseSchema.shape.id,
  });
type Out = z.infer<typeof zOut>;

export { zOut };
export type { Out };
