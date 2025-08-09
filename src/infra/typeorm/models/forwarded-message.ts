import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Chat } from "./chat";
import { LifeCycleDates } from "./life-cycle-dates";
import { Message } from "./message";
import { User } from "./user";

import { Str } from "~/common";

const META = {
  tableName: "forwarded_messages",
  constraints: {
    messageId: () => createForeignKeyConstraintName(META.foreignColumnNames.messageId),
    forwardedById: () => createForeignKeyConstraintName(META.foreignColumnNames.forwardedById),
    chatId: () => createForeignKeyConstraintName(META.foreignColumnNames.chatId),
  },
  foreignColumnNames: {
    messageId: "message_id",
    forwardedById: "forwarded_by_id",
    chatId: "chat_id",
  },
};

function createForeignKeyConstraintName(columnName: string) {
  return [META.tableName, columnName, "fk"].join(Str.UNDERSCORE);
}

@Entity(META.tableName)
class ForwardedMessage {
  @PrimaryGeneratedColumn("identity")
  id!: number;

  @Column(() => LifeCycleDates, {
    prefix: false,
  })
  lifeCycleDates!: LifeCycleDates;

  @ManyToOne(() => Message, ({ forwarding }) => forwarding, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: META.foreignColumnNames.messageId,
    foreignKeyConstraintName: META.constraints.messageId(),
  })
  message!: Message;

  @ManyToOne(() => User, ({ forwardedMessages }) => forwardedMessages, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: META.foreignColumnNames.forwardedById,
    foreignKeyConstraintName: META.constraints.forwardedById(),
  })
  forwardedBy!: User;

  @ManyToOne(() => Chat, ({ messages }) => messages, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: META.foreignColumnNames.chatId,
    foreignKeyConstraintName: META.constraints.chatId(),
  })
  chat!: Chat;
}

export { META as FORWARDED_MESSAGE_META, ForwardedMessage };
