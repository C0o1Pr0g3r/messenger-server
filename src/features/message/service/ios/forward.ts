import type { z } from "zod";

import { Message } from "~/domain";

const zIn = Message.zForwardedMessageSchema.pick({
  messageId: true,
  forwardedById: true,
  chatId: true,
});
type In = z.infer<typeof zIn>;

export { zIn };
export type { In };
