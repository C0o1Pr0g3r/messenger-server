import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { ChatServiceIos } from "../../service";

const zReqPath = z.object({
  id: z.coerce.number().pipe(ChatServiceIos.Delete.zIn.shape.id),
});
class ReqPath extends createZodDto(zReqPath) {}

export { ReqPath, zReqPath };
