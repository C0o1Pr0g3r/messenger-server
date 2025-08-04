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

import { Common, Create, Delete, Edit, Forward, GetMessagesByChatId, GetMine } from "./ios";

import { ForeignKeyViolationError, NotFoundError } from "~/app";
import { Fp } from "~/common";
import * as domain from "~/domain";
import { AuthGuard } from "~/features/auth/auth.guard";
import { CurrentUser, RequestWithUser } from "~/features/auth/current-user.decorator";
import { ChatService } from "~/features/chat/service";
import { EventGateway } from "~/features/ws/event-gateway";
import { Outgoing } from "~/features/ws/message";

@Controller("messages")
class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
    private readonly eventGateway: EventGateway,
  ) {}

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
    return Fp.throwify(
      await function_.pipe(
        this.messageService.create({
          text: text_message,
          authorId: user.id,
          chatId: id_chat,
        }),
        taskEither.map(mapMessage),
        taskEither.tapIO((message) =>
          this.sendWsMessage(Outgoing.MessageType.SendMessage, message),
        ),
        taskEither.mapLeft((error) => {
          if (error instanceof NotFoundError)
            return new NotFoundException("Could not find a chat with this ID.");

          return new InternalServerErrorException();
        }),
      )(),
    );
  }

  @Post("editmessage")
  @UseGuards(AuthGuard)
  async edit(
    @Body() { id_message, text_message }: Edit.ReqBody,
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<Common.ResBody> {
    return Fp.throwify(
      await function_.pipe(
        this.messageService.edit({
          id: id_message,
          text: text_message,
          initiatorId: user.id,
        }),
        taskEither.map(mapMessage),
        taskEither.tapIO((message) =>
          this.sendWsMessage(Outgoing.MessageType.EditMessage, message),
        ),
        taskEither.mapLeft((error) => {
          if (error instanceof NotFoundError)
            return new NotFoundException("Message with this ID not found.");

          return new InternalServerErrorException();
        }),
      )(),
    );
  }

  @Post("deletemessage")
  @UseGuards(AuthGuard)
  async delete(
    @Body() { id_message }: Delete.ReqBody,
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<true> {
    return Fp.throwify(
      await function_.pipe(
        this.messageService.getById({
          id: id_message,
        }),
        taskEither.flatMap((message) =>
          function_.pipe(
            this.messageService.delete({
              id: id_message,
              initiatorId: user.id,
            }),
            taskEither.tapIO(() =>
              this.sendWsMessage(Outgoing.MessageType.DeleteMessage, mapMessage(message)),
            ),
            taskEither.mapLeft((error) => {
              if (error instanceof NotFoundError)
                return new NotFoundException("Message with this ID not found.");

              return new InternalServerErrorException();
            }),
          ),
        ),
      )(),
    );
  }

  @Post("resendmessage")
  @UseGuards(AuthGuard)
  async forward(
    @Body() { id_message, rk_chat }: Forward.ReqBody,
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<true> {
    return Fp.throwify(
      await function_.pipe(
        this.messageService.forward({
          messageId: id_message,
          forwardedById: user.id,
          chatId: rk_chat,
        }),
        taskEither.mapLeft((error) => {
          if (error instanceof ForeignKeyViolationError) {
            switch (error.constraintName) {
              case domain.Message.ForwardedMessageConstraint.MESSAGE:
                return new NotFoundException("Message with this ID not found.");
              case domain.Message.ForwardedMessageConstraint.FORWARDED_BY:
                return new NotFoundException("Your account was not found.");
              case domain.Message.ForwardedMessageConstraint.CHAT:
                return new NotFoundException("Chat with this ID not found.");
            }
          }

          return new InternalServerErrorException();
        }),
      )(),
    );
  }

  private sendWsMessage(
    type: Extract<
      Outgoing.MessageType,
      | typeof Outgoing.MessageType.SendMessage
      | typeof Outgoing.MessageType.EditMessage
      | typeof Outgoing.MessageType.DeleteMessage
    >,
    message: Common.ResBody,
  ) {
    return function_.pipe(
      this.chatService.getParticipantIds({
        id: message.rk_chat,
      }),
      taskEither.tapIO((participantIds) =>
        taskEither.right(
          this.eventGateway.sendMessage(
            {
              type,
              data: message,
            },
            participantIds,
          ),
        ),
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
