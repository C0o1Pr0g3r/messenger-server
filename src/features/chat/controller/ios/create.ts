import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { zChatTypeFromNumber } from "./common";

import { Chat, User } from "~/domain";

const zReqBody = z
  .object({
    rk_type_chat: zChatTypeFromNumber,
  })
  .merge(
    z
      .object({
        name_chat: Chat.zSchema.shape.name,
        id_user: User.zSchema.shape.id,
      })
      .partial(),
  );
class ReqBody extends createZodDto(zReqBody) {}

export { ReqBody, zReqBody };
