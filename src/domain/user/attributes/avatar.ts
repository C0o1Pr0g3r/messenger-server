import z from "zod";

import { File as FileModule, Zod } from "~/common";

const zSchema = z.string().url().nullable();

const FILE_CONSTRAINTS = {
  mimeType: [
    FileModule.MimeType.gif,
    FileModule.MimeType.jpeg,
    FileModule.MimeType.png,
    FileModule.MimeType.svg,
  ] as const satisfies FileModule.MimeType[],
};

const zFileSchema = z
  .instanceof(File)
  .superRefine(Zod.File.REFINEMENTS.isOneOf(FILE_CONSTRAINTS.mimeType));

export { FILE_CONSTRAINTS, zFileSchema, zSchema };
