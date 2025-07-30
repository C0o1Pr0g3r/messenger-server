import { createZodDto } from "nestjs-zod";

import { UserServiceIos } from "../../service";

const zReqBody = UserServiceIos.Create.zIn;
class ReqBody extends createZodDto(zReqBody) {}

export { ReqBody, zReqBody };
