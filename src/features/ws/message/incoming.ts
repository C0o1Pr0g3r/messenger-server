import { z } from "zod";

const zMessageType = z.enum(["Token"]);
const MessageType = zMessageType.Enum;
type MessageType = z.infer<typeof zMessageType>;

const DISCRIMINATOR = "type";

const zMessage = z.discriminatedUnion(DISCRIMINATOR, [
  z.object({
    [DISCRIMINATOR]: z.literal(MessageType.Token),
    data: z.string().jwt(),
  }),
]);
type Message = z.infer<typeof zMessage>;

export { MessageType, zMessage, zMessageType };
export type { Message };
