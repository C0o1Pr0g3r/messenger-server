import z from "zod";

const zMethod = z.enum(["GET", "PUT", "PATCH", "POST", "DELETE"]);
const Method = zMethod.enum;
type Method = z.infer<typeof zMethod>;

export { Method, zMethod };
