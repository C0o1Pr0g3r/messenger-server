import z from "zod";

import { zBaseSchema as zChatBaseSchema } from "../chat";
import { zLifeCycleDates } from "../life-cycle-dates";
import { zSchema as zUserSchema } from "../user";

import { zSchema } from "./schema";

const zForwardedMessageSchema = zLifeCycleDates
  .pick({
    createdAt: true,
  })
  .extend({
    id: z.number().int(),
    messageId: zSchema.shape.id,
    forwardedById: zUserSchema.shape.id,
    chatId: zChatBaseSchema.shape.id,
  });
type ForwardedMessageSchema = z.infer<typeof zForwardedMessageSchema>;

export { zForwardedMessageSchema };
export type { ForwardedMessageSchema };
