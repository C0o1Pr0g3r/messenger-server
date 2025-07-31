import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { either, function as function_, taskEither } from "fp-ts";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { DataSource, DeepPartial, In, Repository } from "typeorm";

import { InterlocutorNotFoundError, ProhibitedOperationError } from "./error";
import { AddUserToChat, Common, Create, GetMine } from "./ios";

import { NotFoundError, UniqueKeyViolationError } from "~/app";
import { File, Fp, Generator, ImpossibleError, UnexpectedError } from "~/common";
import * as domain from "~/domain";
import { Typeorm } from "~/infra";
import { isForeignKeyViolationError } from "~/infra/typeorm";

@Injectable()
class ChatService {
  constructor(
    @InjectRepository(Typeorm.Model.Chat)
    private readonly chatRepository: Repository<Typeorm.Model.Chat>,
    @InjectRepository(Typeorm.Model.ChatParticipant)
    private readonly chatParticipantRepository: Repository<Typeorm.Model.ChatParticipant>,
    private readonly dataSource: DataSource,
  ) {}

  create({
    authorId,
    ...params
  }: Create.In): taskEither.TaskEither<
    UnexpectedError | ImpossibleError | UniqueKeyViolationError | InterlocutorNotFoundError,
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

          return function_.pipe(
            params.type === domain.Chat.Attribute.Type.zSchema.Enum.dialogue
              ? Fp.iife(() => {
                  const { interlocutorId, type, ...rest } = params as Omit<
                    typeof params,
                    "type"
                  > & {
                    type: domain.Chat.Attribute.Type.Schema;
                  };
                  const data = {
                    ...rest,
                    type,
                    author,
                  };
                  return taskEither.right<UnexpectedError, typeof data>(data);
                })
              : Fp.iife(() => {
                  const { type, ...rest } = params as Omit<typeof params, "type"> & {
                    type: domain.Chat.Attribute.Type.Schema;
                  };
                  return function_.pipe(
                    Generator.safeUid(File.Base64.getNumberOfBytesToStore(CHAT_LINK_LENGTH)),
                    taskEither.map((link) => ({
                      ...rest,
                      type,
                      link,
                      author,
                    })),
                  );
                }),
            taskEither.flatMap((chatCreationData) =>
              function_.pipe(
                taskEither.tryCatch(
                  () =>
                    chatRepository.save(
                      Object.assign(
                        chatRepository.create(),
                        chatCreationData satisfies Partial<
                          ReturnType<typeof chatRepository.create>
                        >,
                      ),
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
                taskEither.flatMap((participants) => mapChat(chat, participants)),
              ),
            ),
          )();
        }),
      taskEither.fromTask,
      taskEither.flatMap(taskEither.fromEither),
    );
  }

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
              author: true,
              participants: {
                user: true,
              },
            },
          }),
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.flatMap((chatModels) => {
        const eitherChats = chatModels.map(({ author, participants, ...chatModel }) =>
          mapChat(chatModel, [author, ...participants.map(({ user }) => user)]),
        );

        type Chat = Extract<
          Awaited<ReturnType<(typeof eitherChats)[number]>>,
          either.Right<unknown>
        >["right"];
        return taskEither.sequenceArray(eitherChats) as taskEither.TaskEither<
          ImpossibleError,
          Chat[]
        >;
      }),
    );
  }

  addUserToChat({
    initiatorId,
    userId,
    chatId,
  }: AddUserToChat.In): taskEither.TaskEither<
    | UnexpectedError
    | UniqueKeyViolationError
    | InterlocutorNotFoundError
    | ProhibitedOperationError,
    void
  > {
    return function_.pipe(
      taskEither.tryCatch(
        () =>
          this.chatRepository.findOne({
            where: {
              id: chatId,
            },
            relations: {
              author: true,
              participants: true,
            },
          }),
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.flatMap(taskEither.fromNullable(new NotFoundError())),
      taskEither.flatMap(
        taskEither.fromPredicate(
          (chat) => chat.type === domain.Chat.Attribute.Type.Schema.polylogue,
          () => new ProhibitedOperationError("You can only add users to a group chat."),
        ),
      ),
      taskEither.flatMap(
        taskEither.fromPredicate(
          (chat) =>
            chat.author.id === initiatorId ||
            chat.participants.some(({ userId }) => userId === initiatorId),
          () =>
            new ProhibitedOperationError(
              "You are not a member of this chat, so you cannot add a user to it.",
            ),
        ),
      ),
      taskEither.flatMap(() =>
        function_.pipe(
          taskEither.tryCatch(
            () =>
              this.chatParticipantRepository.save(
                Object.assign(this.chatParticipantRepository.create(), {
                  user: {
                    id: userId,
                  },
                  chat: {
                    id: chatId,
                  },
                } satisfies DeepPartial<ReturnType<typeof this.chatParticipantRepository.create>>),
              ),
            (reason) => {
              if (
                Typeorm.isUniqueKeyViolationError(reason) &&
                reason.driverError.constraint ===
                  Typeorm.Model.CHAT_PARTICIPANT_META.constraints.primaryKey()
              )
                return new UniqueKeyViolationError(domain.Chat.Constraint.UNIQUE_CHAT_PARTICIPANT);

              if (isForeignKeyViolationError(reason)) return new InterlocutorNotFoundError();

              return new UnexpectedError(reason);
            },
          ),
          taskEither.map(() => void 0),
        ),
      ),
    );
  }
}

const CHAT_LINK_LENGTH = 16;

function mapChat(
  chatModel: Omit<Typeorm.Model.Chat, "author" | "participants">,
  participantModels: Typeorm.Model.User[],
) {
  const { id } = chatModel;
  const baseChat = {
    id,
    participants: participantModels,
  };

  return (
    chatModel.type === domain.Chat.Attribute.Type.Schema.dialogue
      ? taskEither.right({
          ...baseChat,
          type: domain.Chat.Attribute.Type.Schema.dialogue,
        })
      : Fp.iife(() => {
          const { name, link } = chatModel;
          if (!(typeof name === "string" && typeof link === "string"))
            return taskEither.left(
              new ImpossibleError("Polylogue chat must have a name and a link", {
                factualData: chatModel,
              }),
            );

          return taskEither.right({
            ...baseChat,
            name,
            link,
            type: domain.Chat.Attribute.Type.Schema.polylogue,
          });
        })
  ) satisfies TaskEither<ImpossibleError, Common.Out>;
}

export { CHAT_LINK_LENGTH, ChatService };
