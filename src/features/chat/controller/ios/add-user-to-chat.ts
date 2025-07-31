import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { Chat, User } from "~/domain";

const zReqBody = z.object({
  id_user: User.zSchema.shape.id,
  id_chat: Chat.zBaseSchema.shape.id,
});
class ReqBody extends createZodDto(zReqBody) {}

export { ReqBody, zReqBody };
