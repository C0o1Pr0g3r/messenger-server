import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { function as function_, taskEither } from "fp-ts";
import { Repository } from "typeorm";

import { GetMine } from "./ios";

import { ImpossibleError, UnexpectedError } from "~/common";
import { Typeorm } from "~/infra";

@Injectable()
class MessageService {
  constructor(
    @InjectRepository(Typeorm.Model.Chat)
    private readonly chatRepository: Repository<Typeorm.Model.Chat>,
  ) {}

  getMine({
    userId,
  }: GetMine.In): taskEither.TaskEither<UnexpectedError | ImpossibleError, GetMine.Out> {
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
              mapMessage({
                ...message,
                chat: {
                  id,
                },
              }),
            ),
          )
          .flat(),
      ),
    );
  }
}

function mapMessage(
  messageModel: Omit<Typeorm.Model.Message, "chat"> & {
    chat: Pick<Typeorm.Model.Chat, "id">;
  },
) {
  const {
    id,
    text,
    lifeCycleDates: { createdAt },
    author: { id: authorId },
    chat: { id: chatId },
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
