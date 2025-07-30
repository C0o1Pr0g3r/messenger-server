import {
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Post,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { function as function_, taskEither } from "fp-ts";
import * as jwt from "jsonwebtoken";
import * as ms from "ms";

import { UserService } from "../service";

import { Common, Create, Login } from "./ios";

import { NotFoundError, UniqueKeyViolationError } from "~/app";
import { Fp, UnexpectedError } from "~/common";
import * as domain from "~/domain";
import { Config } from "~/infra";

@Controller("users")
class UserController {
  constructor(
    private readonly configService: ConfigService<Config.Config, true>,
    private readonly userService: UserService,
  ) {}

  @Post("register")
  async register(@Body() body: Create.ReqBody): Promise<Common.ResBody> {
    const { id, nickname, email, isPrivate } = Fp.throwify(
      await function_.pipe(
        this.userService.create(body),
        taskEither.mapLeft((error) => {
          if (
            error instanceof UniqueKeyViolationError &&
            error.constraintName === domain.User.Constraint.UNIQUE_USER_EMAIL
          )
            return new ConflictException("This email address is already taken by another user.");

          return new InternalServerErrorException();
        }),
      )(),
    );

    return {
      id_user: id,
      nickname,
      email,
      private_acc: isPrivate,
      token: Fp.throwify(
        await generateJwt({
          ...this.configService.get("auth", {
            infer: true,
          }),
          payload: {
            userId: id,
          },
        })(),
      ).token,
    };
  }

  @Post("login")
  async login(@Body() body: Login.ReqBody): Promise<Common.ResBody> {
    const { id, nickname, email, isPrivate } = Fp.throwify(
      await function_.pipe(
        this.userService.get(body),
        taskEither.mapLeft((error) => {
          if (error instanceof NotFoundError)
            return new NotFoundException("Incorrect email address and/or password.");

          return new InternalServerErrorException();
        }),
      )(),
    );

    return {
      id_user: id,
      nickname,
      email,
      private_acc: isPrivate,
      token: Fp.throwify(
        await generateJwt({
          ...this.configService.get("auth", {
            infer: true,
          }),
          payload: {
            userId: id,
          },
        })(),
      ).token,
    };
  }
}

function generateJwt<T extends Record<string, unknown>>({
  secret,
  payload,
  lifetime,
}: {
  secret: string;
  payload: T;
  lifetime: ms.StringValue;
}) {
  const clonedPayload = globalThis.structuredClone(payload);
  return function_.pipe(
    taskEither.tryCatch(
      () =>
        new Promise<string>((resolve, reject) =>
          jwt.sign(
            clonedPayload,
            secret,
            {
              expiresIn: lifetime,
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

export { UserController };
