import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { MessageServiceIos } from "../../service";

const zReqPath = z.object({
  id: z.coerce.number().pipe(MessageServiceIos.GetById.zIn.shape.id),
});
class ReqPath extends createZodDto(zReqPath) {}

export { ReqPath, zReqPath };
