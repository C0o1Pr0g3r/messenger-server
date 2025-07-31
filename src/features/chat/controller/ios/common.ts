import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { ChatServiceIos } from "../../service";

import { Chat } from "~/domain";

const CHAT_TYPE_NUMBER_STARTS_WITH = 1;
const zChatTypeAsNumber = z
  .number()
  .int()
  .min(CHAT_TYPE_NUMBER_STARTS_WITH)
  .max(CHAT_TYPE_NUMBER_STARTS_WITH + Object.values(Chat.Attribute.Type.zSchema.Enum).length - 1);

const CHAT_TYPE_BY_NUMBER = Object.fromEntries(
  [Chat.Attribute.Type.zSchema.Enum.dialogue, Chat.Attribute.Type.zSchema.Enum.polylogue].map(
    (value, index) => [index + CHAT_TYPE_NUMBER_STARTS_WITH, value],
  ),
) as Record<number, Chat.Attribute.Type.Schema>;

const zChatTypeFromNumber = zChatTypeAsNumber
  .transform((value) => CHAT_TYPE_BY_NUMBER[value])
  .pipe(Chat.Attribute.Type.zSchema);

const zResBody = z.object({
  id_chat: Chat.zBaseSchema.shape.id,
  name_chat: ChatServiceIos.Common.zPolylogueOutOut.shape.name,
  rk_type_chat: Chat.Attribute.Type.zSchema,
  link: ChatServiceIos.Common.zPolylogueOutOut.shape.link,
  users: ChatServiceIos.Common.zBaseOut.shape.participants,
});
class ResBody extends createZodDto(zResBody) {}

export { ResBody, zChatTypeAsNumber, zChatTypeFromNumber, zResBody };
