import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { MessageServiceIos } from "../../service";

import { Message } from "~/domain";

const COMMON_KEYS_FOR_OMIT = {
  forwardedById: true,
} as const;

const zOriginalReqBody = MessageServiceIos.Forward.zOriginalIn.omit({
  ...COMMON_KEYS_FOR_OMIT,
});

const zForwardedReqBody = MessageServiceIos.Forward.zForwardedIn.omit({
  ...COMMON_KEYS_FOR_OMIT,
});

const zReqBody = z.object({
  data: z.discriminatedUnion(Message.DISCRIMINATOR, [zOriginalReqBody, zForwardedReqBody]),
});

class ReqBody extends createZodDto(zReqBody) {}

export { ReqBody, zReqBody };
