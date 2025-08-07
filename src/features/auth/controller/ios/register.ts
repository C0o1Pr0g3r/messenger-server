import { createZodDto } from "nestjs-zod";

import { User } from "~/domain";
import { UserServiceIos } from "~/features/user/service";

const zReqBody = UserServiceIos.Create.zIn
  .omit({
    avatar: true,
  })
  .extend({
    avatarUrl: User.Attribute.Avatar.zSchema.optional(),
  });
class ReqBody extends createZodDto(zReqBody) {}

const zReqFile = User.Attribute.Avatar.zFileSchema.optional();
export { ReqBody, zReqBody, zReqFile };
