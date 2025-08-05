import { z } from "zod";

import { Common as ChatControllerCommon } from "~/features/chat/controller/ios";
import { Common as MessageControllerCommon } from "~/features/message/controller/ios";
import { Common as UserControllerCommon } from "~/features/user/controller/ios";

const zMessageType = z.enum([
  "SendMessage",
  "EditMessage",
  "DeleteMessage",
  "CreateChat",
  "EditChat",
  "DeleteChat",
  "AddUserToChat",
]);
const MessageType = zMessageType.Enum;
type MessageType = z.infer<typeof zMessageType>;

const DISCRIMINATOR = "type";

const zMessage = z.discriminatedUnion(DISCRIMINATOR, [
  z.object({
    [DISCRIMINATOR]: z.literal(MessageType.SendMessage),
    data: MessageControllerCommon.zResBody,
  }),
  z.object({
    [DISCRIMINATOR]: z.literal(MessageType.EditMessage),
    data: MessageControllerCommon.zResBody,
  }),
  z.object({
    [DISCRIMINATOR]: z.literal(MessageType.DeleteMessage),
    data: MessageControllerCommon.zResBody,
  }),
  z.object({
    [DISCRIMINATOR]: z.literal(MessageType.CreateChat),
    data: ChatControllerCommon.zResBody,
  }),
  z.object({
    [DISCRIMINATOR]: z.literal(MessageType.EditChat),
    data: ChatControllerCommon.zResBody,
  }),
  z.object({
    [DISCRIMINATOR]: z.literal(MessageType.DeleteChat),
    data: ChatControllerCommon.zResBody,
  }),
  z.object({
    [DISCRIMINATOR]: z.literal(MessageType.AddUserToChat),
    data: z.object({
      user: UserControllerCommon.zResBody,
      chat: ChatControllerCommon.zResBody.pick({
        id: true,
      }),
    }),
  }),
]);
type Message = z.infer<typeof zMessage>;

export { MessageType, zMessage, zMessageType };
export type { Message };
