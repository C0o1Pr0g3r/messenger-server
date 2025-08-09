import { z } from "zod";

import { Chat, Message, User } from "~/domain";

const zBaseIn = z.object({
  forwardedById: User.zSchema.shape.id,
  chatId: Chat.zBaseSchema.shape.id,
});
type BaseIn = z.infer<typeof zBaseIn>;

const COMMON_KEYS_FOR_PICK = {
  id: true,
  [Message.DISCRIMINATOR]: true,
} as const;

const zOriginalIn = zBaseIn.merge(
  Message.zOriginalSchema.pick({
    ...COMMON_KEYS_FOR_PICK,
  }),
);

const zForwardedIn = zBaseIn.merge(
  Message.zForwardedSchema.pick({
    ...COMMON_KEYS_FOR_PICK,
  }),
);

const zIn = z.discriminatedUnion(Message.DISCRIMINATOR, [zOriginalIn, zForwardedIn]);
type In = z.infer<typeof zIn>;

export { zBaseIn, zForwardedIn, zIn, zOriginalIn };
export type { BaseIn, In };
