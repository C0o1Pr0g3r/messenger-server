import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { MessageServiceIos } from "../../service";

const zReqBody = z.object({
  id_message: MessageServiceIos.Forward.zIn.shape.messageId,
  rk_chat: MessageServiceIos.Forward.zIn.shape.chatId,
});
class ReqBody extends createZodDto(zReqBody) {}

export { ReqBody, zReqBody };
