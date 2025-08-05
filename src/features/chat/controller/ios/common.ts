import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { ChatServiceIos } from "../../service";

import { Chat } from "~/domain";
import { UserServiceIos } from "~/features/user/service";

const zResBody = Chat.zBaseSchema
  .pick({
    id: true,
  })
  .extend({
    type: Chat.Attribute.Type.zSchema,
    participants: z.array(
      UserServiceIos.Common.zOut.pick({
        id: true,
        nickname: true,
        email: true,
        isPrivate: true,
      }),
    ),
  })
  .merge(
    ChatServiceIos.Common.zPolylogueOutOut.pick({
      name: true,
      link: true,
    }),
  );
class ResBody extends createZodDto(zResBody) {}

export { ResBody, zResBody };
