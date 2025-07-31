import { z } from "zod";

import { Chat, User } from "~/domain";

const zBaseIn = z.object({
  authorId: User.zSchema.shape.id,
});

const DISCRIMINATOR = "type";

const zIn = z.discriminatedUnion(DISCRIMINATOR, [
  zBaseIn.extend({
    [DISCRIMINATOR]: z.literal(Chat.Attribute.Type.zSchema.Enum.dialogue),
    interlocutorId: User.zSchema.shape.id,
  }),
  zBaseIn.merge(
    Chat.zSchema
      .pick({
        name: true,
      })
      .extend({
        [DISCRIMINATOR]: z.literal(Chat.Attribute.Type.zSchema.Enum.polylogue),
      }),
  ),
]);
type In = z.infer<typeof zIn>;

export { zBaseIn, zIn };
export type { In };
