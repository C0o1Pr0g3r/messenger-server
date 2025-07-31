import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { MessageServiceIos } from "../../service";

const zReqBody = z.object({
  text_message: MessageServiceIos.Create.zIn.shape.text,
  id_chat: MessageServiceIos.Create.zIn.shape.chatId,
});
class ReqBody extends createZodDto(zReqBody) {}

export { ReqBody, zReqBody };
