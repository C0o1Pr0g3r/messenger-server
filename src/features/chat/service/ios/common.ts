import { z } from "zod";

import { Chat, User } from "~/domain";

const zOut = Chat.zSchema
  .pick({
    id: true,
    name: true,
    link: true,
    type: true,
  })
  .extend({
    participants: z.array(
      User.zSchema.pick({
        id: true,
        nickname: true,
        email: true,
        isPrivate: true,
      }),
    ),
  });
type Out = z.infer<typeof zOut>;

export { zOut };
export type { Out };
