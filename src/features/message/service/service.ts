import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { function as function_, taskEither } from "fp-ts";
import { DeepPartial, Repository } from "typeorm";

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
import { UnexpectedError } from "~/common";
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
    initiatorId,
  }: Delete.In): taskEither.TaskEither<UnexpectedError | NotFoundError, true> {
    return function_.pipe(
      taskEither.tryCatch(
        () =>
          this.messageRepository.delete({
            id,
            author: {
              id: initiatorId,
            },
          }),
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.flatMap(
        taskEither.fromPredicate(
          ({ affected }) => affected === 1,
          () => new NotFoundError(),
        ),
      ),
      taskEither.map(() => true),
    );
  }

  getById({ id }: GetById.In): taskEither.TaskEither<UnexpectedError | NotFoundError, Common.Out> {
    return function_.pipe(
      taskEither.tryCatch(
        () =>
          this.messageRepository.findOne({
            where: {
              id,
            },
            relations: {
              author: true,
              chat: true,
            },
          }),
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.flatMap(taskEither.fromNullable(new NotFoundError())),
      taskEither.map((message) =>
        mapMessage(message, {
          authorId: message.author.id,
          chatId: message.chat.id,
        }),
      ),
    );
  }

  forward({
    messageId,
    forwardedById,
    chatId,
  }: Forward.In): taskEither.TaskEither<UnexpectedError | ForeignKeyViolationError, true> {
    return function_.pipe(
      taskEither.tryCatch(
        () => {
          const baseWhere: NonNullable<
            Parameters<typeof this.messageRepository.findOne>[0]
          >["where"] = {
            id: messageId,
          };

          return this.messageRepository.findOne({
            where: [
              {
                ...baseWhere,
                chat: {
                  type: domain.Chat.Attribute.Type.Schema.dialogue,
                  author: {
                    id: forwardedById,
                  },
                },
              },
              {
                ...baseWhere,
                chat: {
                  type: domain.Chat.Attribute.Type.Schema.dialogue,
                  interlocutor: {
                    id: forwardedById,
                  },
                },
              },
              {
                ...baseWhere,
                chat: {
                  type: domain.Chat.Attribute.Type.Schema.polylogue,
                  participants: {
                    userId: forwardedById,
                  },
                },
              },
            ],
          });
        },
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.flatMap(
        taskEither.fromNullable(
          new ForeignKeyViolationError(domain.Message.ForwardedMessageConstraint.MESSAGE),
        ),
      ),
      taskEither.flatMap(() =>
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
      taskEither.flatMap(() =>
        function_.pipe(
          taskEither.tryCatch(
            () =>
              this.forwardedMessageRepository.save(
                Object.assign(this.forwardedMessageRepository.create(), {
                  message: {
                    id: messageId,
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
    .map((message) => (message instanceof Typeorm.Model.Message ? message : message.message))
    .map((message) =>
      mapMessage(message, {
        authorId: message.author.id,
        chatId: id,
      }),
    );
}

function mapMessage(
  messageModel: Omit<Typeorm.Model.Message, "author" | "chat">,
  {
    authorId,
    chatId,
  }: {
    authorId: Typeorm.Model.Message["author"]["id"];
    chatId: Typeorm.Model.Message["chat"]["id"];
  },
) {
  const {
    id,
    text,
    lifeCycleDates: { createdAt },
  } = messageModel;

  return {
    id,
    text,
    createdAt,
    authorId,
    chatId,
  };
}

export { MessageService };
