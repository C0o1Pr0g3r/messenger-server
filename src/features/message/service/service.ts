import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { function as function_, taskEither } from "fp-ts";
import { DeepPartial, Repository } from "typeorm";

import { Common, Create, Edit, GetMessagesByChatId, GetMine } from "./ios";

import { NotFoundError } from "~/app";
import { UnexpectedError } from "~/common";
import { Typeorm } from "~/infra";

@Injectable()
class MessageService {
  constructor(
    @InjectRepository(Typeorm.Model.Chat)
    private readonly chatRepository: Repository<Typeorm.Model.Chat>,
    @InjectRepository(Typeorm.Model.Message)
    private readonly messageRepository: Repository<Typeorm.Model.Message>,
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
                participants: {
                  userId,
                },
              },
            ],
            relations: {
              messages: {
                author: true,
              },
            },
          }),
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.map((chatModels) =>
        chatModels
          .map(({ id, messages }) =>
            messages.map((message) =>
              mapMessage(message, {
                authorId: message.author.id,
                chatId: id,
              }),
            ),
          )
          .flat(),
      ),
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
            },
          }),
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.flatMap(taskEither.fromNullable(new NotFoundError())),
      taskEither.map((chatModel) =>
        chatModel.messages.map((message) =>
          mapMessage(message, {
            authorId: message.author.id,
            chatId,
          }),
        ),
      ),
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
