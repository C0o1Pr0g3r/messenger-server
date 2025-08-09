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

const zOriginalOut = zBaseOut.merge(
  Message.zOriginalSchema
    .pick({
      ...COMMON_KEYS_FOR_PICK,
      text: true,
    })
    .extend(COMMON_EXTEND_SHAPE),
);

const zForwardedOut = zBaseOut.merge(
  Message.zForwardedSchema
    .pick({
      ...COMMON_KEYS_FOR_PICK,
      messageId: true,
    })
    .extend(COMMON_EXTEND_SHAPE),
);
type ForwardedOut = z.infer<typeof zForwardedOut>;

const zOut = z.discriminatedUnion(Message.DISCRIMINATOR, [zOriginalOut, zForwardedOut]);
type Out = z.infer<typeof zOut>;

export { zBaseOut, zForwardedOut, zOriginalOut, zOut };
export type { BaseOut, ForwardedOut, Out };
