import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { UserServiceIos } from "~/features/user/service";

const zResBody = UserServiceIos.Common.zOut
  .pick({
    id: true,
    nickname: true,
    email: true,
    isPrivate: true,
    avatar: true,
  })
  .extend({
    token: z.string().jwt(),
  });
class ResBody extends createZodDto(zResBody) {}

export { ResBody, zResBody };
