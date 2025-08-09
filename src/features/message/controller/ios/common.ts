import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { MessageServiceIos } from "../../service";

const zResBody = z.object({
  data: MessageServiceIos.Common.zOut,
});
class ResBody extends createZodDto(zResBody) {}

export { ResBody, zResBody };
