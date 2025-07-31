import { z } from "zod";

import { zOut as zBaseOut } from "./common";

import { Chat, User } from "~/domain";

const zIn = z.object({
  userId: User.zSchema.shape.id,
  chatId: Chat.zBaseSchema.shape.id,
});
type In = z.infer<typeof zIn>;

const zOut = z.array(zBaseOut);
type Out = z.infer<typeof zOut>;

export { zIn, zOut };
export type { In, Out };
