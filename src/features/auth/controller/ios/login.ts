import { createZodDto } from "nestjs-zod";

import { UserServiceIos } from "~/features/user/service";

const zReqBody = UserServiceIos.Get.zIn;
class ReqBody extends createZodDto(zReqBody) {}

export { ReqBody, zReqBody };
