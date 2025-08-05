import {
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Post,
} from "@nestjs/common";
import { function as function_, taskEither } from "fp-ts";

import { AuthService } from "../service";

import { Common, Login, Register } from "./ios";

import { NotFoundError, UniqueKeyViolationError } from "~/app";
import { Fp } from "~/common";
import * as domain from "~/domain";
import { UserService } from "~/features/user/service";

@Controller("users")
class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post("register")
  async register(@Body() body: Register.ReqBody): Promise<Common.ResBody> {
    const user = Fp.throwify(
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
      ...mapUser(user),
      token: Fp.throwify(
        await this.authService.generateJwt({
          userId: user.id,
        })(),
      ).token,
    };
  }

  @Post("login")
  async login(@Body() body: Login.ReqBody): Promise<Common.ResBody> {
    const user = Fp.throwify(
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
      ...mapUser(user),
      token: Fp.throwify(
        await this.authService.generateJwt({
          userId: user.id,
        })(),
      ).token,
    };
  }
}

function mapUser({
  id,
  nickname,
  email,
  isPrivate,
}: Pick<domain.User.Schema, "id" | "nickname" | "email" | "isPrivate">) {
  return {
    id,
    nickname,
    email,
    isPrivate,
  };
}

export { AuthController };
