import { z } from "zod";

const TRUE = "true";
const FALSE = "false";

const zBooleanishString = z.enum([TRUE, FALSE]).transform((value) => value === TRUE);

export { FALSE, TRUE, zBooleanishString };
