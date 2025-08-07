import { z } from "zod";

const zVercelConfig = z
  .object({
    VERCEL_BLOB_READ_WRITE_TOKEN: z.string().nonempty(),
  })
  .transform(({ VERCEL_BLOB_READ_WRITE_TOKEN }) => ({
    blobReadWriteToken: VERCEL_BLOB_READ_WRITE_TOKEN,
  }));
type VercelConfig = z.infer<typeof zVercelConfig>;

export { zVercelConfig };
export type { VercelConfig };
