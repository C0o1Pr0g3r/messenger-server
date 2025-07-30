import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { UserServiceIos } from "~/features/user/service";

const zResBody = z.object({
  id_user: UserServiceIos.Common.zOut.shape.id,
  nickname: UserServiceIos.Common.zOut.shape.nickname,
  email: UserServiceIos.Common.zOut.shape.email,
  private_acc: UserServiceIos.Common.zOut.shape.isPrivate,
  token: z.string().jwt(),
});
class ResBody extends createZodDto(zResBody) {}

export { ResBody, zResBody };
