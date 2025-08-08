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
import { EventGateway } from "~/features/ws/event-gateway";
import { Outgoing } from "~/features/ws/message";

@Controller("chats")
class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly eventGateway: EventGateway,
  ) {}

  @Post("createchat")
  @UseGuards(AuthGuard)
  async updateMe(
    @Body() { type, name, interlocutorId }: Create.ReqBody,
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<Common.ResBody> {
    if (interlocutorId === user.id)
      throw new BadRequestException("You cannot create a chat with yourself.");

    try {
      return Fp.throwify(
        await function_.pipe(
          this.chatService.create(
            ChatServiceIos.Create.zIn.parse({
              authorId: user.id,
              ...(type === domain.Chat.Attribute.Type.zSchema.Enum.dialogue
                ? {
                    type,
                    interlocutorId,
                  }
                : {
                    type,
                    name,
                  }),
            }),
          ),
          taskEither.map((chat) => mapChat(chat, user.id)),
          taskEither.tapIO((chat) =>
            this.sendWsMessage(
              {
                type: Outgoing.MessageType.CreateChat,
                data: chat,
              },
              chat.id,
            ),
          ),
          taskEither.mapLeft((error) => {
            if (
              error instanceof UniqueKeyViolationError &&
              error.constraintName === domain.Chat.Constraint.UNIQUE_CHAT_LINK
            )
              return new ConflictException("Failed to create chat. Try again.");

            if (error instanceof InterlocutorNotFoundError)
              return new BadRequestException(
                `Unable to find interlocutor with ID = ${interlocutorId}.`,
              );

            return new InternalServerErrorException();
          }),
        )(),
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
    ).map((chat) => mapChat(chat, user.id));
  }

  @Post("addusertochat")
  @UseGuards(AuthGuard)
  async addUserToChat(
    @Body() { chatId, userId }: AddUserToChat.ReqBody,
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<void> {
    try {
      Fp.throwify(
        await function_.pipe(
          this.chatService.addUserToChat({
            initiatorId: user.id,
            chatId,
            userId,
          }),
          taskEither.tapIO(() =>
            function_.pipe(
              this.chatService.getById({
                id: chatId,
              }),
              taskEither.tapIO((chat) => {
                this.eventGateway.sendMessage(
                  {
                    type: Outgoing.MessageType.CreateChat,
                    data: mapChat(chat, userId),
                  },
                  [userId],
                );
                this.eventGateway.sendMessage(
                  {
                    type: Outgoing.MessageType.AddUserToChat,
                    data: {
                      user: {
                        id: userId,
                        ...Fp.iife(() => {
                          const {
                            nickname = Str.EMPTY,
                            email = Str.EMPTY,
                            isPrivate = false,
                            avatar = null,
                          } = chat.participants.find(({ id }) => id === userId) ?? {};
                          return {
                            nickname,
                            email,
                            isPrivate,
                            avatar,
                          };
                        }),
                      },
                      chat: {
                        id: chatId,
                      },
                    },
                  },
                  chat.participants.filter(({ id }) => id !== userId).map(({ id }) => id),
                );
                return taskEither.right(void 0);
              }),
            ),
          ),
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

  private sendWsMessage(
    message: Extract<
      Outgoing.Message,
      {
        type:
          | typeof Outgoing.MessageType.CreateChat
          | typeof Outgoing.MessageType.EditChat
          | typeof Outgoing.MessageType.DeleteChat
          | typeof Outgoing.MessageType.AddUserToChat;
      }
    >,
    chatId: domain.Chat.BaseSchema["id"],
  ) {
    return function_.pipe(
      this.chatService.getParticipantIds({
        id: chatId,
      }),
      taskEither.tapIO((participantIds) =>
        taskEither.right(this.eventGateway.sendMessage(message, participantIds)),
      ),
    );
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

function mapChat(
  { id, type, participants, authorId, ...params }: ChatServiceIos.Common.Out,
  userId: domain.User.Schema["id"],
) {
  const {
    name = participants.find(({ id }) => id !== userId)?.nickname ?? Str.EMPTY,
    link = Str.EMPTY,
  } = params as Partial<Pick<domain.Chat.PolylogueSchema, "name" | "link">>;

  return {
    id,
    name,
    link,
    type,
    authorId,
    participants: participants.map(mapUser),
  };
}

export { ChatController };
