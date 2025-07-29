import { z } from "zod";

const CONSTRAINTS = {
  length: {
    minimum: 6,
    maximum: 32,
  },
};

const zSchema = z.string().trim().min(CONSTRAINTS.length.minimum).max(CONSTRAINTS.length.maximum);

export { CONSTRAINTS, zSchema };
