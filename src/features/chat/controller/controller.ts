import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  UseGuards,
} from "@nestjs/common";
import { function as function_, taskEither } from "fp-ts";
import { z } from "zod";

import { ChatService, ChatServiceIos } from "../service";
import { InterlocutorNotFoundError, ProhibitedOperationError } from "../service/error";

import { AddUserToChat, Common, Create, GetMine } from "./ios";

import { UniqueKeyViolationError } from "~/app";
import { Fp, Str } from "~/common";
import * as domain from "~/domain";
import { AuthGuard } from "~/features/auth/auth.guard";
import { CurrentUser, RequestWithUser } from "~/features/auth/current-user.decorator";

@Controller("chats")
class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("createchat")
  @UseGuards(AuthGuard)
  async updateMe(
    @Body() { rk_type_chat, name_chat, id_user }: Create.ReqBody,
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<Common.ResBody> {
    try {
      return mapChat(
        Fp.throwify(
          await function_.pipe(
            this.chatService.create(
              ChatServiceIos.Create.zIn.parse({
                authorId: user.id,
                ...(rk_type_chat === domain.Chat.Attribute.Type.zSchema.Enum.dialogue
                  ? {
                      type: rk_type_chat,
                      interlocutorId: id_user,
                    }
                  : {
                      type: rk_type_chat,
                      name: name_chat,
                    }),
              }),
            ),
            taskEither.mapLeft((error) => {
              if (
                error instanceof UniqueKeyViolationError &&
                error.constraintName === domain.Chat.Constraint.UNIQUE_CHAT_LINK
              )
                return new ConflictException("Failed to create chat. Try again.");

              if (error instanceof InterlocutorNotFoundError)
                return new BadRequestException(`Unable to find interlocutor with ID = ${id_user}.`);

              return new InternalServerErrorException();
            }),
          )(),
        ),
      );
    } catch (error) {
      if (error instanceof z.ZodError) throw new BadRequestException(error);

      throw error;
    }
  }

  @Get("getchats")
  @UseGuards(AuthGuard)
  async getByEmailOrNickname(
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<GetMine.ResBody> {
    return Fp.throwify(
      await function_.pipe(
        this.chatService.getMine({
          userId: user.id,
        }),
      )(),
    ).map(mapChat);
  }

  @Post("addusertochat")
  @UseGuards(AuthGuard)
  async addUserToChat(
    @Body() { id_user, id_chat }: AddUserToChat.ReqBody,
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<void> {
    try {
      Fp.throwify(
        await function_.pipe(
          this.chatService.addUserToChat({
            initiatorId: user.id,
            userId: id_user,
            chatId: id_chat,
          }),
          taskEither.mapLeft((error) => {
            if (
              error instanceof UniqueKeyViolationError &&
              error.constraintName === domain.Chat.Constraint.UNIQUE_CHAT_PARTICIPANT
            )
              return new ConflictException("This user is already in the chat.");

            if (error instanceof InterlocutorNotFoundError)
              return new BadRequestException("User with this ID not found.");

            if (error instanceof ProhibitedOperationError)
              return new BadRequestException(error.explanation);

            return new InternalServerErrorException();
          }),
        )(),
      );
    } catch (error) {
      if (error instanceof z.ZodError) throw new BadRequestException(error);

      throw error;
    }
  }
}

function mapChat({ id, type, participants, ...params }: ChatServiceIos.Common.Out) {
  const { name = Str.EMPTY, link = Str.EMPTY } = params as Partial<
    Pick<domain.Chat.PolylogueSchema, "name" | "link">
  >;

  return {
    id_chat: id,
    name_chat: name,
    link,
    rk_type_chat: type,
    users: participants,
  };
}

export { ChatController };
