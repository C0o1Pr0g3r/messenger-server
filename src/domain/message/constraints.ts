import { z } from "zod";

const zForwardedMessageConstraint = z.enum(["MESSAGE", "FORWARDED_BY", "CHAT"]);
const ForwardedMessageConstraint = zForwardedMessageConstraint.enum;
type ForwardedMessageConstraint = z.infer<typeof zForwardedMessageConstraint>;

export { ForwardedMessageConstraint, zForwardedMessageConstraint };
