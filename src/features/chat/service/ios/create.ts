import { z } from "zod";

import { Chat, User } from "~/domain";

const zBaseIn = z.object({
  authorId: User.zSchema.shape.id,
});
type BaseIn = z.infer<typeof zBaseIn>;

const COMMON_KEYS_FOR_PICK = {
  type: true,
} as const;

const zIn = z.discriminatedUnion(Chat.DISCRIMINATOR, [
  zBaseIn.merge(
    Chat.zDialogueSchema
      .pick({
        ...COMMON_KEYS_FOR_PICK,
      })
      .extend({
        interlocutorId: User.zSchema.shape.id,
      }),
  ),
  zBaseIn.merge(
    Chat.zPolylogueSchema.pick({
      ...COMMON_KEYS_FOR_PICK,
      name: true,
    }),
  ),
]);
type In = z.infer<typeof zIn>;

export { zBaseIn, zIn };
export type { BaseIn, In };
