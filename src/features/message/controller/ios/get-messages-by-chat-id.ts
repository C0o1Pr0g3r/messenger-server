import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { MessageServiceIos } from "../../service";

import { zResBody as zBaseResBody } from "./common";

const zReqQuery = z.object({
  chatId: z.coerce.number().pipe(MessageServiceIos.GetMessagesByChatId.zIn.shape.chatId),
});
class ReqQuery extends createZodDto(zReqQuery) {}

const zResBody = z.array(zBaseResBody);
class ResBody extends createZodDto(zResBody) {}

export { ReqQuery, ResBody, zReqQuery, zResBody };
