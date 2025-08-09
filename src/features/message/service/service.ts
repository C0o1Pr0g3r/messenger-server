import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { function as function_, taskEither } from "fp-ts";
import { DeepPartial, Repository } from "typeorm";

import { ProhibitedOperationError } from "./error";
import {
  Common,
  Create,
  Delete,
  Edit,
  Forward,
  GetById,
  GetMessagesByChatId,
  GetMine,
} from "./ios";

import { ForeignKeyViolationError, NotFoundError } from "~/app";
import { ImpossibleError, TypeGuard, UnexpectedError } from "~/common";
import * as domain from "~/domain";
import { Typeorm } from "~/infra";

@Injectable()
class MessageService {
  constructor(
    @InjectRepository(Typeorm.Model.Chat)
    private readonly chatRepository: Repository<Typeorm.Model.Chat>,
    @InjectRepository(Typeorm.Model.Message)
    private readonly messageRepository: Repository<Typeorm.Model.Message>,
    @InjectRepository(Typeorm.Model.ForwardedMessage)
    private readonly forwardedMessageRepository: Repository<Typeorm.Model.ForwardedMessage>,
  ) {}

  getMine({ userId }: GetMine.In): taskEither.TaskEither<UnexpectedError, GetMine.Out> {
    return function_.pipe(
      taskEither.tryCatch(
        () =>
          this.chatRepository.find({
            where: [
              {
                author: {
                  id: userId,
                },
              },
              {
                interlocutor: {
                  id: userId,
                },
              },
              {
                participants: {
                  userId,
                },
              },
            ],
            relations: {
              messages: {
                author: true,
              },
              forwardedMessages: {
                message: {
                  author: true,
                },
                forwardedBy: true,
              },
            },
          }),
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.map((chatModels) => chatModels.map(mapChat).flat()),
    );
  }

  getMessagesByChatId({
    userId,
    chatId,
  }: GetMessagesByChatId.In): taskEither.TaskEither<
    UnexpectedError | NotFoundError,
    GetMessagesByChatId.Out
  > {
    const baseWhere: NonNullable<Parameters<typeof this.chatRepository.findOne>[0]>["where"] = {
      id: chatId,
    };

    return function_.pipe(
      taskEither.tryCatch(
        () =>
          this.chatRepository.findOne({
            where: [
              {
                ...baseWhere,
                author: {
                  id: userId,
                },
              },
              {
                ...baseWhere,
                participants: {
                  userId,
                },
              },
            ],
            relations: {
              messages: {
                author: true,
              },
              forwardedMessages: {
                message: {
                  author: true,
                },
                forwardedBy: true,
              },
            },
          }),
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.flatMap(taskEither.fromNullable(new NotFoundError())),
      taskEither.map(mapChat),
    );
  }

  create({
    text,
    authorId,
    chatId,
  }: Create.In): taskEither.TaskEither<UnexpectedError | NotFoundError, Common.Out> {
    const baseWhere: NonNullable<Parameters<typeof this.chatRepository.findOne>[0]>["where"] = {
      id: chatId,
    };

    return function_.pipe(
      taskEither.tryCatch(
        () =>
          this.chatRepository.findOne({
            where: [
              {
                ...baseWhere,
                author: {
                  id: authorId,
                },
              },
              {
                ...baseWhere,
                interlocutor: {
                  id: authorId,
                },
              },
              {
                ...baseWhere,
                participants: {
                  userId: authorId,
                },
              },
            ],
          }),
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.flatMap(taskEither.fromNullable(new NotFoundError())),
      taskEither.flatMap(() =>
        function_.pipe(
          taskEither.tryCatch(
            () =>
              this.messageRepository.save(
                Object.assign(this.messageRepository.create(), {
                  text,
                  author: {
                    id: authorId,
                  },
                  chat: {
                    id: chatId,
                  },
                } satisfies DeepPartial<ReturnType<typeof this.messageRepository.create>>),
              ),
            (reason) => new UnexpectedError(reason),
          ),
        ),
      ),
      taskEither.map((message) =>
        mapMessage(message, {
          authorId,
          chatId,
        }),
      ),
    );
  }

  edit({
    id,
    text,
    initiatorId,
  }: Edit.In): taskEither.TaskEither<UnexpectedError | NotFoundError, Common.Out> {
    return function_.pipe(
      taskEither.tryCatch(
        () =>
          this.messageRepository.update(
            {
              id,
              author: {
                id: initiatorId,
              },
            },
            {
              text,
            },
          ),
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.flatMap(
        taskEither.fromPredicate(
          ({ affected }) => affected === 1,
          () => new NotFoundError(),
        ),
      ),
      taskEither.flatMap(() =>
        function_.pipe(
          taskEither.tryCatch(
            () =>
              this.messageRepository.findOne({
                where: {
                  id,
                },
                relations: {
                  chat: true,
                },
              }),
            (reason) => new UnexpectedError(reason),
          ),
          taskEither.flatMap(taskEither.fromNullable(new NotFoundError())),
          taskEither.map((message) =>
            mapMessage(message, {
              authorId: initiatorId,
              chatId: message.chat.id,
            }),
          ),
        ),
      ),
    );
  }

  delete({
    id,
    originType,
    initiatorId,
  }: Delete.In): taskEither.TaskEither<
    UnexpectedError | NotFoundError | ProhibitedOperationError,
    true
  > {
    return function_.pipe(
      taskEither.tryCatch(
        () =>
          originType === domain.Message.Attribute.OriginType.Schema.original
            ? this.messageRepository.delete({
                id,
                author: {
                  id: initiatorId,
                },
              })
            : this.forwardedMessageRepository.delete({
                id,
                forwardedBy: {
                  id: initiatorId,
                },
              }),
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.flatMap(({ affected }) => {
        if (affected === 1) return taskEither.right(void 0);
        if (affected === 0 && originType === domain.Message.Attribute.OriginType.Schema.forwarded)
          return taskEither.left(
            new ProhibitedOperationError("You cannot delete a message forwarded by another user."),
          );

        return taskEither.left(new NotFoundError());
      }),
      taskEither.map(() => true),
    );
  }

  getById({
    id,
    originType,
    userId,
  }: GetById.In): taskEither.TaskEither<UnexpectedError | NotFoundError, Common.Out> {
    return function_.pipe(
      taskEither.tryCatch(
        (): Promise<Typeorm.Model.Message | Typeorm.Model.ForwardedMessage | null> =>
          originType === domain.Message.Attribute.OriginType.Schema.original
            ? this.messageRepository.findOne({
                where: [
                  {
                    id,
                    chat: {
                      author: {
                        id: userId,
                      },
                    },
                  },
                  {
                    id,
                    chat: {
                      interlocutor: {
                        id: userId,
                      },
                    },
                  },
                  {
                    id,
                    chat: {
                      participants: {
                        userId: userId,
                      },
                    },
                  },
                  {
                    id,
                    forwarding: {
                      chat: {
                        author: {
                          id: userId,
                        },
                      },
                    },
                  },
                  {
                    id,
                    forwarding: {
                      chat: {
                        interlocutor: {
                          id: userId,
                        },
                      },
                    },
                  },
                  {
                    id,
                    forwarding: {
                      chat: {
                        participants: {
                          userId: userId,
                        },
                      },
                    },
                  },
                ],
                relations: {
                  author: true,
                  chat: true,
                },
              })
            : this.forwardedMessageRepository.findOne({
                where: [
                  {
                    id,
                    chat: {
                      author: {
                        id: userId,
                      },
                    },
                  },
                  {
                    id,
                    chat: {
                      interlocutor: {
                        id: userId,
                      },
                    },
                  },
                  {
                    id,
                    chat: {
                      participants: {
                        userId: userId,
                      },
                    },
                  },
                ],
                relations: {
                  message: true,
                  forwardedBy: true,
                  chat: true,
                },
              }),
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.flatMap(taskEither.fromNullable(new NotFoundError())),
      taskEither.map((message) =>
        mapMessage(message, {
          authorId:
            message instanceof Typeorm.Model.Message ? message.author.id : message.forwardedBy.id,
          chatId: message.chat.id,
        }),
      ),
    );
  }

  forward({
    id,
    originType,
    forwardedById,
    chatId,
  }: Forward.In): taskEither.TaskEither<UnexpectedError | ForeignKeyViolationError, true> {
    return function_.pipe(
      taskEither.tryCatch(
        () => {
          const baseWhere: NonNullable<
            Parameters<typeof this.messageRepository.findOne>[0]
          >["where"] =
            originType === domain.Message.Attribute.OriginType.Schema.original
              ? {
                  id,
                }
              : {
                  forwarding: {
                    id,
                  },
                };

          const chatWheres: NonNullable<
            NonNullable<Parameters<typeof this.chatRepository.findOne>[0]>["where"]
          >[] = [
            {
              type: domain.Chat.Attribute.Type.Schema.dialogue,
              author: {
                id: forwardedById,
              },
            },
            {
              type: domain.Chat.Attribute.Type.Schema.dialogue,
              interlocutor: {
                id: forwardedById,
              },
            },
            {
              type: domain.Chat.Attribute.Type.Schema.polylogue,
              participants: {
                userId: forwardedById,
              },
            },
          ];

          return this.messageRepository.findOne({
            where: chatWheres.map((chatWhere) =>
              originType === domain.Message.Attribute.OriginType.Schema.original
                ? {
                    ...baseWhere,
                    chat: chatWhere,
                  }
                : {
                    forwarding: {
                      ...(TypeGuard.isObject(baseWhere.forwarding) ? baseWhere.forwarding : {}),
                      chat: chatWhere,
                    },
                  },
            ),
          });
        },
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.flatMap(
        taskEither.fromNullable(
          new ForeignKeyViolationError(domain.Message.ForwardedMessageConstraint.MESSAGE),
        ),
      ),
      taskEither.tapIO(() =>
        function_.pipe(
          taskEither.tryCatch(
            () => {
              const baseWhere: NonNullable<
                Parameters<typeof this.chatRepository.findOne>[0]
              >["where"] = {
                id: chatId,
              };

              return this.chatRepository.findOne({
                where: [
                  {
                    ...baseWhere,
                    type: domain.Chat.Attribute.Type.Schema.dialogue,
                    author: {
                      id: forwardedById,
                    },
                  },
                  {
                    ...baseWhere,
                    type: domain.Chat.Attribute.Type.Schema.dialogue,
                    interlocutor: {
                      id: forwardedById,
                    },
                  },
                  {
                    ...baseWhere,
                    type: domain.Chat.Attribute.Type.Schema.polylogue,
                    participants: {
                      userId: forwardedById,
                    },
                  },
                ],
              });
            },
            (reason) => new UnexpectedError(reason),
          ),
          taskEither.flatMap(
            taskEither.fromNullable(
              new ForeignKeyViolationError(domain.Message.ForwardedMessageConstraint.CHAT),
            ),
          ),
        ),
      ),
      taskEither.flatMap((message) =>
        function_.pipe(
          taskEither.tryCatch(
            () =>
              this.forwardedMessageRepository.save(
                Object.assign(this.forwardedMessageRepository.create(), {
                  message: {
                    id: message.id,
                  },
                  forwardedBy: {
                    id: forwardedById,
                  },
                  chat: {
                    id: chatId,
                  },
                } satisfies DeepPartial<ReturnType<typeof this.forwardedMessageRepository.create>>),
              ),
            (reason) => {
              if (Typeorm.isForeignKeyViolationError(reason)) {
                const { constraint } = reason.driverError;

                switch (constraint) {
                  case Typeorm.Model.FORWARDED_MESSAGE_META.constraints.messageId():
                    return new ForeignKeyViolationError(
                      domain.Message.ForwardedMessageConstraint.MESSAGE,
                    );
                  case Typeorm.Model.FORWARDED_MESSAGE_META.constraints.forwardedById():
                    return new ForeignKeyViolationError(
                      domain.Message.ForwardedMessageConstraint.FORWARDED_BY,
                    );
                  case Typeorm.Model.FORWARDED_MESSAGE_META.constraints.chatId():
                    return new ForeignKeyViolationError(
                      domain.Message.ForwardedMessageConstraint.CHAT,
                    );
                }
              }

              return new UnexpectedError(reason);
            },
          ),
        ),
      ),
      taskEither.map(() => true),
    );
  }
}

function mapChat({ id, messages, forwardedMessages }: Typeorm.Model.Chat) {
  return [...messages, ...forwardedMessages]
    .sort(
      (
        { lifeCycleDates: { createdAt: aCreatedAt } },
        { lifeCycleDates: { createdAt: bCreatedAt } },
      ) => aCreatedAt.getTime() - bCreatedAt.getTime(),
    )
    .map((message) =>
      mapMessage(message, {
        authorId:
          message instanceof Typeorm.Model.Message ? message.author.id : message.forwardedBy.id,
        chatId: id,
      }),
    );
}

function mapMessage(
  messageModel: Typeorm.Model.Message | Typeorm.Model.ForwardedMessage,
  {
    authorId,
    chatId,
  }: {
    authorId: Typeorm.Model.Message["author"]["id"];
    chatId: Typeorm.Model.Message["chat"]["id"];
  },
): Common.Out {
  const {
    id,
    lifeCycleDates: { createdAt },
  } = messageModel;

  if (messageModel instanceof Typeorm.Model.Message) {
    const { text } = messageModel;
    return {
      originType: domain.Message.Attribute.OriginType.Schema.original,
      id,
      text,
      createdAt,
      authorId,
      chatId,
    };
  } else if (messageModel instanceof Typeorm.Model.ForwardedMessage) {
    return {
      originType: domain.Message.Attribute.OriginType.Schema.forwarded,
      id,
      messageId: messageModel.message.id,
      createdAt,
      authorId,
      chatId,
    };
  }
  throw new ImpossibleError(
    "messageModel must be an instance of Typeorm.Model.Message or Typeorm.Model.ForwardedMessage",
  );
}

export { MessageService };
