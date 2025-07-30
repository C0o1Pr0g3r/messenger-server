import { createZodDto } from "nestjs-zod";
import z from "zod";

import { UserServiceIos } from "../../service";

const zReqQuery = z.object({
  id: z.coerce.number().pipe(UserServiceIos.GetById.zIn.shape.id),
});
class ReqQuery extends createZodDto(zReqQuery) {}

export { ReqQuery, zReqQuery };
