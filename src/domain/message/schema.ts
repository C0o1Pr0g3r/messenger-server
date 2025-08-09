import z from "zod";

import { zLifeCycleDates } from "../life-cycle-dates";

import { OriginType } from "./attributes";

const zBaseSchema = zLifeCycleDates.extend({
  id: z.number().int(),
});
type BaseSchema = z.infer<typeof zBaseSchema>;

const DISCRIMINATOR = "originType";

const zOriginalSchema = zBaseSchema.extend({
  [DISCRIMINATOR]: z.literal(OriginType.zSchema.Enum.original),
  text: z.string().trim().nonempty(),
});
type OriginalSchema = z.infer<typeof zOriginalSchema>;

const zForwardedSchema = zBaseSchema.extend({
  [DISCRIMINATOR]: z.literal(OriginType.zSchema.Enum.forwarded),
  messageId: zBaseSchema.shape.id,
});
type ForwardedSchema = z.infer<typeof zForwardedSchema>;

const zSchema = z.discriminatedUnion(DISCRIMINATOR, [zOriginalSchema, zForwardedSchema]);
type Schema = z.infer<typeof zSchema>;

export { DISCRIMINATOR, zBaseSchema, zForwardedSchema, zOriginalSchema, zSchema };
export type { BaseSchema, ForwardedSchema, OriginalSchema, Schema };
