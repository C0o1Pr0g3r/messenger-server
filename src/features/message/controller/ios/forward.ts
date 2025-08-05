import { createZodDto } from "nestjs-zod";

import { MessageServiceIos } from "../../service";

const zReqBody = MessageServiceIos.Forward.zIn.pick({
  messageId: true,
  chatId: true,
});
class ReqBody extends createZodDto(zReqBody) {}

export { ReqBody, zReqBody };
