import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { function as function_, taskEither } from "fp-ts";

import { UserService, UserServiceIos } from "../service";

import { Common, GetByEmailOrNickname, GetById, UpdateMe } from "./ios";

import { NotFoundError, UniqueKeyViolationError } from "~/app";
import { Fp } from "~/common";
import * as domain from "~/domain";
import { AuthGuard } from "~/features/auth/auth.guard";
import { CurrentUser, RequestWithUser } from "~/features/auth/current-user.decorator";

@Controller("users")
class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("edituser")
  @UseGuards(AuthGuard)
  async updateMe(
    @Body() { nickname, email, private_acc, password, new_password }: UpdateMe.ReqBody,
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<Common.ResBody> {
    return mapUser(
      Fp.throwify(
        await function_.pipe(
          this.userService.updateMe(
            UserServiceIos.UpdateMe.zIn.parse({
              id: user.id,
              nickname,
              email,
              isPrivate: private_acc,
              ...(password && new_password
                ? {
                    withPassword: true,
                    currentPassword: password,
                    newPassword: new_password,
                  }
                : {
                    withPassword: false,
                  }),
            } satisfies UserServiceIos.UpdateMe.In),
          ),
          taskEither.mapLeft((error) => {
            if (error instanceof NotFoundError)
              return new BadRequestException("The current password is incorrect.");

            if (
              error instanceof UniqueKeyViolationError &&
              error.constraintName === domain.User.Constraint.UNIQUE_USER_EMAIL
            )
              return new ConflictException("This email address is already taken by another user.");

            return new InternalServerErrorException();
          }),
        )(),
      ),
    );
  }

  @Get("getuserbyid")
  async getById(@Query() query: GetById.ReqQuery): Promise<Common.ResBody> {
    return mapUser(
      Fp.throwify(
        await function_.pipe(
          this.userService.getById(query),
          taskEither.mapLeft((error) => {
            if (error instanceof NotFoundError)
              return new BadRequestException(`User with ID = ${query.id} not found.`);

            return new InternalServerErrorException();
          }),
        )(),
      ),
    );
  }

  @Get("finduser")
  async getByEmailOrNickname(
    @Query() query: GetByEmailOrNickname.ReqQuery,
  ): Promise<GetByEmailOrNickname.ResBody> {
    return Fp.throwify(
      await function_.pipe(
        this.userService.getByEmailOrNickname({
          emailOrNickname: query.user_data_to_find,
        }),
      )(),
    ).map(mapUser);
  }
}

function mapUser({
  id,
  nickname,
  email,
  isPrivate,
}: Pick<domain.User.Schema, "id" | "nickname" | "email" | "isPrivate">) {
  return {
    id_user: id,
    nickname,
    email,
    private_acc: isPrivate,
  };
}

export { UserController };
