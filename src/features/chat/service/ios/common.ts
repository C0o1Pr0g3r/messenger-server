import { z } from "zod";

import { Chat, User } from "~/domain";

const zBaseOut = z.object({
  participants: z.array(
    User.zSchema.pick({
      id: true,
      nickname: true,
      email: true,
      isPrivate: true,
    }),
  ),
});
type BaseOut = z.infer<typeof zBaseOut>;

const COMMON_KEYS_FOR_PICK = {
  id: true,
  type: true,
} as const;

const zDialogueOut = zBaseOut.merge(
  Chat.zDialogueSchema.pick({
    ...COMMON_KEYS_FOR_PICK,
  }),
);

const zPolylogueOutOut = zBaseOut.merge(
  Chat.zPolylogueSchema.pick({
    ...COMMON_KEYS_FOR_PICK,
    name: true,
    link: true,
  }),
);

const zOut = z.discriminatedUnion(Chat.DISCRIMINATOR, [zDialogueOut, zPolylogueOutOut]);
type Out = z.infer<typeof zOut>;

export { zBaseOut, zDialogueOut, zOut, zPolylogueOutOut };
export type { BaseOut, Out };
