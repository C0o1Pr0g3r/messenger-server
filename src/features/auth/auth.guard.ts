import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { either } from "fp-ts";

import { RequestWithUser } from "./current-user.decorator";
import { AuthService } from "./service";
import { ExpirationError, VerificationError } from "./service/error";

import { Str } from "~/common";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();

    const authorizationHeader = req.headers.authorization;

    if (typeof authorizationHeader !== "string")
      throw new UnauthorizedException("Unable to authenticate you. Authorization header missing.");

    const [_scheme, token] = authorizationHeader.split(Str.SPACE);

    if (typeof token !== "string")
      throw new UnauthorizedException(
        "Unable to authenticate you. Authorization header is invalid.",
      );

    const verificationResult = await this.authService.verifyJwt(token)();

    if (either.isLeft(verificationResult)) {
      const error = verificationResult.left;

      if (error instanceof ExpirationError)
        throw new UnauthorizedException("Your authentication session has expired.");

      if (error instanceof VerificationError)
        throw new UnauthorizedException("Your authentication token is invalid.");

      throw new UnauthorizedException("Unable to authenticate you.");
    }

    (req as unknown as RequestWithUser).user = {
      id: verificationResult.right.userId,
    };

    return true;
  }
}
