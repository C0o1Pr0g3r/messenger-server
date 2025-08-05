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
          ...query,
          userId: user.id,
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
    @Body() body: Create.ReqBody,
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<Common.ResBody> {
    return Fp.throwify(
      await function_.pipe(
        this.messageService.create({
          ...body,
          authorId: user.id,
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
    @Body() body: Edit.ReqBody,
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<Common.ResBody> {
    return Fp.throwify(
      await function_.pipe(
        this.messageService.edit({
          ...body,
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
    @Body() body: Delete.ReqBody,
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<true> {
    return Fp.throwify(
      await function_.pipe(
        this.messageService.getById(body),
        taskEither.flatMap((message) =>
          function_.pipe(
            this.messageService.delete({
              id: body.id,
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
    @Body() body: Forward.ReqBody,
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<true> {
    return Fp.throwify(
      await function_.pipe(
        this.messageService.forward({
          ...body,
          forwardedById: user.id,
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
        id: message.chatId,
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
    id,
    text,
    createdAt,
    authorId,
    chatId,
  };
}

export { MessageController };
