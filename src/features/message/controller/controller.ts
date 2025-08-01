import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { function as function_, taskEither } from "fp-ts";

import { MessageService, MessageServiceIos } from "../service";

import { Common, Create, Edit, GetMessagesByChatId, GetMine } from "./ios";

import { NotFoundError } from "~/app";
import { Fp } from "~/common";
import { AuthGuard } from "~/features/auth/auth.guard";
import { CurrentUser, RequestWithUser } from "~/features/auth/current-user.decorator";

@Controller("messages")
class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get("getallmessages")
  @UseGuards(AuthGuard)
  async getByEmailOrNickname(
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<GetMine.ResBody> {
    return Fp.throwify(
      await function_.pipe(
        this.messageService.getMine({
          userId: user.id,
        }),
      )(),
    ).map(mapMessage);
  }

  @Get("getallmessagesfromchat")
  @UseGuards(AuthGuard)
  async getMessagesByChatId(
    @Query() query: GetMessagesByChatId.ReqQuery,
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<GetMine.ResBody> {
    return Fp.throwify(
      await function_.pipe(
        this.messageService.getMessagesByChatId({
          userId: user.id,
          chatId: query.id_chat,
        }),
        taskEither.mapLeft((error) => {
          if (error instanceof NotFoundError)
            return new NotFoundException("Could not find a chat with this ID.");

          return new InternalServerErrorException();
        }),
      )(),
    ).map(mapMessage);
  }

  @Post("sendmessage")
  @UseGuards(AuthGuard)
  async create(
    @Body() { text_message, id_chat }: Create.ReqBody,
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<Common.ResBody> {
    return mapMessage(
      Fp.throwify(
        await function_.pipe(
          this.messageService.create({
            text: text_message,
            authorId: user.id,
            chatId: id_chat,
          }),
          taskEither.mapLeft((error) => {
            if (error instanceof NotFoundError)
              return new NotFoundException("Could not find a chat with this ID.");

            return new InternalServerErrorException();
          }),
        )(),
      ),
    );
  }

  @Post("editmessage")
  @UseGuards(AuthGuard)
  async edit(
    @Body() { id_message, text_message }: Edit.ReqBody,
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<Common.ResBody> {
    return mapMessage(
      Fp.throwify(
        await function_.pipe(
          this.messageService.edit({
            id: id_message,
            text: text_message,
            initiatorId: user.id,
          }),
          taskEither.mapLeft((error) => {
            if (error instanceof NotFoundError)
              return new NotFoundException("Could not find a chat with this ID.");

            return new InternalServerErrorException();
          }),
        )(),
      ),
    );
  }
}

function mapMessage({ id, text, createdAt, authorId, chatId }: MessageServiceIos.Common.Out) {
  return {
    id_message: id,
    text_message: text,
    data_time: createdAt,
    rk_user: authorId,
    rk_chat: chatId,
  };
}

export { MessageController };
