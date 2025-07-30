import { createZodDto } from "nestjs-zod";

import { UserServiceIos } from "../../service";

const zReqBody = UserServiceIos.Get.zIn;
class ReqBody extends createZodDto(zReqBody) {}

export { ReqBody, zReqBody };
