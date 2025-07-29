import z from "zod";

import { zLifeCycleDates } from "../life-cycle-dates";

import { Password, PasswordHash } from "./attributes";

const zSchema = zLifeCycleDates.extend({
  id: z.number().int(),
  nickname: z.string().trim().nonempty(),
  email: z.email(),
  password: Password.zSchema,
  passwordHash: PasswordHash.zSchema,
  isPrivate: z.boolean(),
});
type Schema = z.infer<typeof zSchema>;

export { zSchema };
export type { Schema };
