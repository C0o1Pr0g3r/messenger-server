import z from "zod";

import { zLifeCycleDates } from "../life-cycle-dates";

import { Avatar, Password, PasswordHash } from "./attributes";

const zSchema = zLifeCycleDates.extend({
  id: z.number().int(),
  nickname: z.string().trim().nonempty(),
  email: z.string().email(),
  password: Password.zSchema,
  passwordHash: PasswordHash.zSchema,
  isPrivate: z.boolean(),
  avatar: Avatar.zSchema,
});
type Schema = z.infer<typeof zSchema>;

export { zSchema };
export type { Schema };
