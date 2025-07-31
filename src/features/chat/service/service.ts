import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { function as function_, taskEither } from "fp-ts";
import { DataSource, In, Repository } from "typeorm";

import { InterlocutorNotFoundError } from "./error";
import { Common, Create } from "./ios";

import { UniqueKeyViolationError } from "~/app";
import { File, Fp, Generator, Str, UnexpectedError } from "~/common";
import * as domain from "~/domain";
import { Typeorm } from "~/infra";
import { isForeignKeyViolationError } from "~/infra/typeorm";

@Injectable()
class ChatService {
  constructor(
    @InjectRepository(Typeorm.Model.Chat)
    private readonly chatRepository: Repository<Typeorm.Model.Chat>,
    private readonly dataSource: DataSource,
  ) {}

  create({
    authorId,
    ...params
  }: Create.In): taskEither.TaskEither<
    UnexpectedError | UniqueKeyViolationError | InterlocutorNotFoundError,
    Common.Out
  > {
    return function_.pipe(
      () =>
        this.dataSource.transaction((entityManager) => {
          const chatRepository = entityManager.getRepository(Typeorm.Model.Chat);
          const chatParticipantRepository = entityManager.getRepository(
            Typeorm.Model.ChatParticipant,
          );
          const userRepository = entityManager.getRepository(Typeorm.Model.User);

          const author = Object.assign(userRepository.create(), {
            id: authorId,
          } satisfies Partial<ReturnType<typeof userRepository.create>>);
          const chatCreationData =
            params.type === domain.Chat.Attribute.Type.zSchema.Enum.dialogue
              ? Fp.iife(() => {
                  const { interlocutorId, ...rest } = params;
                  return {
                    ...rest,
                    author,
                  };
                })
              : Fp.iife(() => {
                  return {
                    ...params,
                    author,
                  };
                });

          return function_.pipe(
            Generator.safeUid(File.Base64.getNumberOfBytesToStore(CHAT_LINK_LENGTH)),
            taskEither.flatMap((link) =>
              function_.pipe(
                taskEither.tryCatch(
                  () =>
                    chatRepository.save(
                      Object.assign(chatRepository.create(), {
                        ...chatCreationData,
                        link,
                      } satisfies Partial<ReturnType<typeof chatRepository.create>>),
                    ),
                  (reason) => {
                    if (
                      Typeorm.isUniqueKeyViolationError(reason) &&
                      reason.driverError.constraint === Typeorm.Model.CHAT_META.constraints.link
                    )
                      return new UniqueKeyViolationError(domain.Chat.Constraint.UNIQUE_CHAT_LINK);

                    return new UnexpectedError(reason);
                  },
                ),
              ),
            ),
            taskEither.flatMap((chat) =>
              params.type === domain.Chat.Attribute.Type.zSchema.Enum.dialogue
                ? function_.pipe(
                    taskEither.tryCatch(
                      () =>
                        chatParticipantRepository.save(
                          Object.assign(chatParticipantRepository.create(), {
                            chatId: chat.id,
                            userId: params.interlocutorId,
                          } satisfies Partial<ReturnType<typeof chatParticipantRepository.create>>),
                        ),
                      (reason) => {
                        if (isForeignKeyViolationError(reason))
                          return new InterlocutorNotFoundError();

                        return new UnexpectedError(reason);
                      },
                    ),
                    taskEither.map(() => ({
                      chat,
                      participantIDs: [author.id, params.interlocutorId],
                    })),
                  )
                : taskEither.right({
                    chat,
                    participantIDs: [author.id],
                  }),
            ),
            taskEither.flatMap(({ chat, participantIDs }) =>
              function_.pipe(
                taskEither.tryCatch(
                  () =>
                    userRepository.find({
                      where: {
                        id: In(participantIDs),
                      },
                    }),
                  (reason) => new UnexpectedError(reason),
                ),
                taskEither.map((participants) => ({
                  ...chat,
                  name: chat.name ?? Str.EMPTY,
                  participants,
                })),
              ),
            ),
          )();
        }),
      taskEither.fromTask,
      taskEither.flatMap(taskEither.fromEither),
    );
  }
}

const CHAT_LINK_LENGTH = 16;

export { CHAT_LINK_LENGTH, ChatService };
