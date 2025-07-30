import { createParamDecorator } from "@nestjs/common";

import type * as domain from "~/domain";

const CurrentUser = createParamDecorator((_data, context) => {
  const req: RequestWithUser = context.switchToHttp().getRequest();
  const { user } = req;

  return user;
});

type RequestWithUser = {
  user: Pick<domain.User.Schema, "id">;
};

export { CurrentUser };
export type { RequestWithUser };
