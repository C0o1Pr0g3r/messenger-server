import { z } from "zod";

const zConstraint = z.enum(["UNIQUE_USER_EMAIL"]);
const Constraint = zConstraint.enum;
type Constraint = z.infer<typeof zConstraint>;

export { Constraint, zConstraint };
