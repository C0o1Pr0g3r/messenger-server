import z from "zod";

const zSchema = z.string().trim().nonempty();

export { zSchema };
