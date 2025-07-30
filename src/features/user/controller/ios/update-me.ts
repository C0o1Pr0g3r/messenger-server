import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { UserServiceIos } from "../../service";

import { User } from "~/domain";

const zReqBody = UserServiceIos.UpdateMe.zBaseIn
  .omit({
    id: true,
    isPrivate: true,
  })
  .extend({
    private_acc: UserServiceIos.UpdateMe.zBaseIn.shape.isPrivate,
    password: z.union([User.zSchema.shape.password, z.string().length(0)]),
    new_password: z.union([User.zSchema.shape.password, z.string().length(0)]),
  })
  .partial();
class ReqBody extends createZodDto(zReqBody) {}

const zResBody = z.object({
  id_user: UserServiceIos.Common.zOut.shape.id,
  nickname: UserServiceIos.Common.zOut.shape.nickname,
  email: UserServiceIos.Common.zOut.shape.email,
  private_acc: UserServiceIos.Common.zOut.shape.isPrivate,
});
class ResBody extends createZodDto(zResBody) {}

export { ReqBody, ResBody, zReqBody, zResBody };
