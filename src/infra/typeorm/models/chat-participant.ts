import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { Chat } from "./chat";
import { User } from "./user";

import { Str } from "~/common";

const META = {
  tableName: "chat_participants",
  constraints: {
    primaryKey: () =>
      [META.tableName, Object.values(META.primaryColumnNames).join(Str.UNDERSCORE), "pk"].join(
        Str.UNDERSCORE,
      ),
  },
  primaryColumnNames: {
    chatId: "chat_id",
    userId: "user_id",
  },
};

@Entity(META.tableName)
class ChatParticipant {
  @PrimaryColumn({
    type: "int",
    name: META.primaryColumnNames.chatId,
    primaryKeyConstraintName: META.constraints.primaryKey(),
  })
  chatId!: number;

  @PrimaryColumn({
    type: "int",
    name: META.primaryColumnNames.userId,
    primaryKeyConstraintName: META.constraints.primaryKey(),
  })
  userId!: number;

  @CreateDateColumn({
    type: "timestamp",
    name: "created_at",
  })
  createdAt!: Date;

  @ManyToOne(() => Chat, ({ participants }) => participants, {
    nullable: false,
  })
  @JoinColumn({
    name: META.primaryColumnNames.chatId,
  })
  chat!: Chat;

  @ManyToOne(() => User, ({ participantOfChats }) => participantOfChats, {
    nullable: false,
  })
  @JoinColumn({
    name: META.primaryColumnNames.userId,
  })
  user!: User;
}

export { META as CHAT_PARTICIPANT_META, ChatParticipant };
