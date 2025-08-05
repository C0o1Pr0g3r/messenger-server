import { createZodDto } from "nestjs-zod";

import { Chat, Message, User } from "~/domain";

const zResBody = Message.zSchema
  .pick({
    id: true,
    text: true,
    createdAt: true,
  })
  .extend({
    authorId: User.zSchema.shape.id,
    chatId: Chat.zBaseSchema.shape.id,
  });
class ResBody extends createZodDto(zResBody) {}

export { ResBody, zResBody };
