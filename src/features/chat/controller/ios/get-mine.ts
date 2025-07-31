import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { zResBody as zBaseResBody } from "./common";

const zResBody = z.array(zBaseResBody);
class ResBody extends createZodDto(zResBody) {}

export { ResBody, zResBody };
