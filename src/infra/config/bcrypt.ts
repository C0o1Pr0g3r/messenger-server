import { z } from "zod";

const zBcryptConfig = z
  .object({
    BCRYPT_ROUNDS_FOR_PASSWORD_HASH: z.coerce.number().positive(),
  })
  .transform(({ BCRYPT_ROUNDS_FOR_PASSWORD_HASH }) => ({
    roundsForPasswordHash: BCRYPT_ROUNDS_FOR_PASSWORD_HASH,
  }));
type BcryptConfig = z.infer<typeof zBcryptConfig>;

export { zBcryptConfig };
export type { BcryptConfig };
