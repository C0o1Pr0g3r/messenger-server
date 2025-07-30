import { createZodDto } from "nestjs-zod";
import z from "zod";

import { UserServiceIos } from "../../service";

import { zResBody as zBaseResBody } from "./common";

const zReqQuery = z.object({
  user_data_to_find: UserServiceIos.GetByEmailOrNickname.zIn.shape.emailOrNickname,
});
class ReqQuery extends createZodDto(zReqQuery) {}

const zResBody = z.array(zBaseResBody);
class ResBody extends createZodDto(zResBody) {}

export { ReqQuery, ResBody, zReqQuery, zResBody };
