import { createZodDto } from "nestjs-zod";

import { MessageServiceIos } from "../../service";

const zReqBody = MessageServiceIos.Delete.zIn.omit({
  initiatorId: true,
});
class ReqBody extends createZodDto(zReqBody) {}

export { ReqBody, zReqBody };
