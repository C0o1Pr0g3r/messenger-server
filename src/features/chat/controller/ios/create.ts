import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { Chat, User } from "~/domain";

const zReqBody = z
  .object({
    type: Chat.Attribute.Type.zSchema,
  })
  .merge(
    Chat.zPolylogueSchema
      .pick({
        name: true,
      })
      .extend({
        interlocutorId: User.zSchema.shape.id,
      })
      .partial(),
  );
class ReqBody extends createZodDto(zReqBody) {}

export { ReqBody, zReqBody };
