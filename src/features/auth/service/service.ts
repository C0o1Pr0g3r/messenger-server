import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { function as function_, taskEither } from "fp-ts";
import * as jwt from "jsonwebtoken";

import { ExpirationError, VerificationError } from "./error";

import { UnexpectedError } from "~/common";
import * as domain from "~/domain";
import { Config } from "~/infra";

@Injectable()
class AuthService {
  constructor(private readonly configService: ConfigService<Config.Config, true>) {}

  generateJwt<T extends Record<string, unknown>>(payload: T) {
    const clonedPayload = globalThis.structuredClone(payload);
    return function_.pipe(
      taskEither.tryCatch(
        () =>
          new Promise<string>((resolve, reject) =>
            jwt.sign(
              clonedPayload,
              this.configService.get("auth", {
                infer: true,
              }).secret,
              {
                expiresIn: this.configService.get("auth", {
                  infer: true,
                }).lifetime,
                mutatePayload: true,
              },
              (error, encoded) => (error === null ? resolve(encoded!) : reject(error)),
            ),
          ),
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.map((token) => ({
        token,
        payload: clonedPayload,
      })),
    );
  }

  verifyJwt(token: string) {
    type DecodedPayload = SignedPayload<AuthTokenPayload>;

    return taskEither.tryCatch(
      () =>
        new Promise<DecodedPayload>((resolve, reject) =>
          jwt.verify(
            token,
            this.configService.get("auth", {
              infer: true,
            }).secret,
            (error, decoded) =>
              error === null ? resolve(decoded as DecodedPayload) : reject(error),
          ),
        ),
      (reason) => {
        if (reason instanceof jwt.TokenExpiredError) {
          const { expiredAt } = reason;
          return new ExpirationError(expiredAt);
        } else if (reason instanceof jwt.JsonWebTokenError) {
          const jwtReason = REASONS_BY_MESSAGE[reason.message];
          if (!jwtReason) {
            return new UnexpectedError(reason);
          }
          return new VerificationError(jwtReason);
        }
        return new UnexpectedError(reason);
      },
    );
  }
}

type PayloadToSign = Record<string, unknown>;

type SignedPayload<T extends PayloadToSign> = T & {
  exp: number;
  iat: number;
};

type AuthTokenPayload = {
  userId: domain.User.Schema["id"];
};

const REASONS_BY_MESSAGE: Record<string, VerificationError["reason"]> = {
  "invalid token": "SYNTACTICALLY_INCORRECT",
  "jwt malformed": "SYNTACTICALLY_INCORRECT",
  "jwt signature is required": "SYNTACTICALLY_INCORRECT",
  "invalid signature": "CRYPTOGRAPHICALLY_INVALID",
};

export { AuthService };
export type { AuthTokenPayload, PayloadToSign, SignedPayload };
