import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { MessageServiceIos } from "../../service";

const zReqBody = z.object({
  id_message: MessageServiceIos.Edit.zIn.shape.id,
});
class ReqBody extends createZodDto(zReqBody) {}

export { ReqBody, zReqBody };
