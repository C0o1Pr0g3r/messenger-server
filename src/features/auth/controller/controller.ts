import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { function as function_, taskEither } from "fp-ts";

import { AuthService } from "../service";

import { Common, Login, Register } from "./ios";

import { NotFoundError, UniqueKeyViolationError } from "~/app";
import { File, Fp } from "~/common";
import * as domain from "~/domain";
import { UserService, UserServiceIos } from "~/features/user/service";

@Controller("users")
class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post("register")
  @UseInterceptors(FileInterceptor("avatar"))
  async register(
    @Body() { avatarUrl, ...body }: Register.ReqBody,
    @UploadedFile() avatarFile: Express.Multer.File | undefined,
  ): Promise<Common.ResBody> {
    const {
      success,
      data: avatar,
      error,
    } = UserServiceIos.Create.zIn.shape.avatar.safeParse(
      avatarFile ? File.createFileFromMulterFile(avatarFile) : avatarUrl,
    );
    if (!success) throw new BadRequestException(error);

    const user = Fp.throwify(
      await function_.pipe(
        this.userService.create({
          ...body,
          avatar,
        }),
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
  avatar,
}: Pick<domain.User.Schema, "id" | "nickname" | "email" | "isPrivate" | "avatar">) {
  return {
    id,
    nickname,
    email,
    isPrivate,
    avatar,
  };
}

export { AuthController };
