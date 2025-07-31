import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  Post,
  UseGuards,
} from "@nestjs/common";
import { function as function_, taskEither } from "fp-ts";
import { z } from "zod";

import { ChatService, ChatServiceIos } from "../service";
import { InterlocutorNotFoundError } from "../service/error";

import { Common, Create } from "./ios";

import { UniqueKeyViolationError } from "~/app";
import { Fp } from "~/common";
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
}

function mapChat({
  id,
  name,
  link,
  type,
  participants,
}: Pick<domain.Chat.Schema, "id" | "name" | "link" | "type"> &
  Pick<ChatServiceIos.Common.Out, "participants">) {
  return {
    id_chat: id,
    name_chat: name,
    rk_type_chat: type,
    link,
    users: participants,
  };
}

export { ChatController };
