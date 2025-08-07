import { createZodDto } from "nestjs-zod";

import { UserServiceIos } from "~/features/user/service";

const zResBody = UserServiceIos.Common.zOut.pick({
  id: true,
  nickname: true,
  email: true,
  isPrivate: true,
  avatar: true,
});
class ResBody extends createZodDto(zResBody) {}

export { ResBody, zResBody };
