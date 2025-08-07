import z from "zod";

import { User } from "~/domain";

const zIn = User.zSchema
  .pick({
    nickname: true,
    email: true,
    password: true,
  })
  .extend({
    avatar: z.union([User.zSchema.shape.avatar, User.Attribute.Avatar.zFileSchema]).optional(),
  });
type In = z.infer<typeof zIn>;

export { zIn };
export type { In };
