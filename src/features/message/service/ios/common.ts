import { z } from "zod";

import { Chat, Message, User } from "~/domain";

const zBaseOut = Message.zBaseSchema.pick({
  id: true,
  createdAt: true,
});
type BaseOut = z.infer<typeof zBaseOut>;

const COMMON_KEYS_FOR_PICK = {
  [Message.DISCRIMINATOR]: true,
} as const;

const COMMON_EXTEND_SHAPE = {
  authorId: User.zSchema.shape.id,
  chatId: Chat.zBaseSchema.shape.id,
};

const originalOut = zBaseOut.merge(
  Message.zOriginalSchema
    .pick({
      ...COMMON_KEYS_FOR_PICK,
      text: true,
    })
    .extend(COMMON_EXTEND_SHAPE),
);

const zForwardedOutOut = zBaseOut.merge(
  Message.zForwardedSchema
    .pick({
      ...COMMON_KEYS_FOR_PICK,
      messageId: true,
    })
    .extend(COMMON_EXTEND_SHAPE),
);

const zOut = z.discriminatedUnion(Message.DISCRIMINATOR, [originalOut, zForwardedOutOut]);
type Out = z.infer<typeof zOut>;

export { originalOut, zBaseOut, zForwardedOutOut, zOut };
export type { BaseOut, Out };
