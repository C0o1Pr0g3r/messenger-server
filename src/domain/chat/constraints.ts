import { z } from "zod";

const zConstraint = z.enum(["UNIQUE_CHAT_LINK"]);
const Constraint = zConstraint.enum;
type Constraint = z.infer<typeof zConstraint>;

export { Constraint, zConstraint };
