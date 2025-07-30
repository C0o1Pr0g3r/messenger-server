import { z } from "zod";

import { zOut as zBaseOut } from "./common";

const zIn = z.object({
  emailOrNickname: z.string().min(2),
});
type In = z.infer<typeof zIn>;

const zOut = z.array(zBaseOut);
type Out = z.infer<typeof zOut>;

export { zIn, zOut };
export type { In, Out };
