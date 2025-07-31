import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { Chat, Message, User } from "~/domain";

const zResBody = z.object({
  id_message: Message.zSchema.shape.id,
  text_message: Message.zSchema.shape.text,
  data_time: Message.zSchema.shape.createdAt,
  rk_user: User.zSchema.shape.id,
  rk_chat: Chat.zBaseSchema.shape.id,
});
class ResBody extends createZodDto(zResBody) {}

export { ResBody, zResBody };
