import { z } from "zod";

import { Chat, User } from "~/domain";

const zIn = z.object({
  initiatorId: User.zSchema.shape.id,
  userId: User.zSchema.shape.id,
  chatId: Chat.zBaseSchema.shape.id,
});
type In = z.infer<typeof zIn>;

export { zIn };
export type { In };
