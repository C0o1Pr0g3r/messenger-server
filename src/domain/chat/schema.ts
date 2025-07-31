import z from "zod";

import { zLifeCycleDates } from "../life-cycle-dates";

import { Type } from "./attributes";

const zBaseSchema = zLifeCycleDates.extend({
  id: z.number().int(),
});
type BaseSchema = z.infer<typeof zBaseSchema>;

const zDialogueSchema = zBaseSchema.extend({
  type: z.literal(Type.zSchema.Enum.dialogue),
});
type DialogueSchema = z.infer<typeof zDialogueSchema>;

const zPolylogueSchema = zBaseSchema.extend({
  type: z.literal(Type.zSchema.Enum.polylogue),
  name: z.string().trim().nonempty(),
  link: z.string().trim().nonempty(),
});
type PolylogueSchema = z.infer<typeof zPolylogueSchema>;

const DISCRIMINATOR = "type";

const zSchema = z.discriminatedUnion(DISCRIMINATOR, [zDialogueSchema, zPolylogueSchema]);
type Schema = z.infer<typeof zSchema>;

export { DISCRIMINATOR, zBaseSchema, zDialogueSchema, zPolylogueSchema, zSchema };
export type { BaseSchema, DialogueSchema, PolylogueSchema, Schema };
