import { z } from "zod";

import { Chat, User } from "~/domain";

const zIn = Chat.zBaseSchema.pick({
  id: true,
});
type In = z.infer<typeof zIn>;

const zOut = z.array(User.zSchema.shape.id);
type Out = z.infer<typeof zOut>;

export { zIn, zOut };
export type { In, Out };
