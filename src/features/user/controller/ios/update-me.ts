import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { UserServiceIos } from "../../service";

import { User } from "~/domain";

const zReqBody = UserServiceIos.UpdateMe.zBaseIn
  .omit({
    id: true,
  })
  .extend({
    currentPassword: z.union([User.zSchema.shape.password, z.string().length(0)]),
    newPassword: z.union([User.zSchema.shape.password, z.string().length(0)]),
  })
  .partial();
class ReqBody extends createZodDto(zReqBody) {}

export { ReqBody, zReqBody };
