import { z } from "zod";

const zNodeConfig = z
  .object({
    NODE_ENV: z.enum(["dev", "prod"]),
  })
  .transform(({ NODE_ENV }) => ({
    env: NODE_ENV,
  }));
type NodeConfig = z.infer<typeof zNodeConfig>;

export { zNodeConfig };
export type { NodeConfig };
