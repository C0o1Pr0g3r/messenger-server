import { createZodDto } from "nestjs-zod";

import { MessageServiceIos } from "../../service";

const zReqBody = MessageServiceIos.Create.zIn.pick({
  text: true,
  chatId: true,
});
class ReqBody extends createZodDto(zReqBody) {}

export { ReqBody, zReqBody };
