import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { Chat, User } from "~/domain";

const zReqBody = z.object({
  chatId: Chat.zBaseSchema.shape.id,
  userId: User.zSchema.shape.id,
});
class ReqBody extends createZodDto(zReqBody) {}

export { ReqBody, zReqBody };
