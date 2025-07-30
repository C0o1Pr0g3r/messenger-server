import { z } from "zod";

import { User } from "~/domain";

const zBaseIn = User.zSchema
  .pick({
    id: true,
  })
  .merge(
    User.zSchema
      .pick({
        nickname: true,
        email: true,
        isPrivate: true,
      })
      .partial(),
  );

const WITH_PASSWORD_KEY = "withPassword";

const zIn = z.discriminatedUnion(WITH_PASSWORD_KEY, [
  zBaseIn.extend({
    [WITH_PASSWORD_KEY]: z.literal(false),
  }),
  zBaseIn.extend({
    [WITH_PASSWORD_KEY]: z.literal(true),
    currentPassword: User.zSchema.shape.password,
    newPassword: User.zSchema.shape.password,
  }),
]);
type In = z.infer<typeof zIn>;

export { zBaseIn, zIn };
export type { In };
