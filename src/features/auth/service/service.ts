import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { function as function_, taskEither } from "fp-ts";
import * as jwt from "jsonwebtoken";

import { UnexpectedError } from "~/common";
import { Config } from "~/infra";

@Injectable()
export class AuthService {
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
}
