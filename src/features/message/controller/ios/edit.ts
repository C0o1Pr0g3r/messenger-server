import { createZodDto } from "nestjs-zod";

import { MessageServiceIos } from "../../service";

const zReqBody = MessageServiceIos.Edit.zIn.pick({
  id: true,
  text: true,
});
class ReqBody extends createZodDto(zReqBody) {}

export { ReqBody, zReqBody };
