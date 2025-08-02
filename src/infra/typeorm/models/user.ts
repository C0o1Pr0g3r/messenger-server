import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { toColumnOptions } from "../utils";

import { Chat } from "./chat";
import { ChatParticipant } from "./chat-participant";
import { ForwardedMessage } from "./forwarded-message";
import { LifeCycleDates } from "./life-cycle-dates";
import { Message } from "./message";

import * as domain from "~/domain";

const META = {
  tableName: "users",
  constraints: {
    email: "users_email_unique",
  },
};

@Entity(META.tableName)
class User {
  @PrimaryGeneratedColumn("identity")
  id!: number;

  @Column(toColumnOptions(domain.User.zSchema.shape.nickname))
  nickname!: string;

  @Column(toColumnOptions(domain.User.zSchema.shape.email))
  @Index(META.constraints.email, {
    unique: true,
  })
  email!: string;

  @Column({
    ...toColumnOptions(domain.User.zSchema.shape.passwordHash),
    name: "password_hash",
  })
  passwordHash!: string;

  @Column({
    ...toColumnOptions(domain.User.zSchema.shape.isPrivate),
    name: "is_private",
    default: false,
  })
  isPrivate!: boolean;

  @Column(() => LifeCycleDates, {
    prefix: false,
  })
  lifeCycleDates!: LifeCycleDates;

  @OneToMany(() => Chat, ({ author }) => author)
  createdChats!: Chat[];

  @OneToMany(() => Chat, ({ interlocutor }) => interlocutor)
  interlocutorOfChats!: Chat[];

  @OneToMany(() => Message, ({ author }) => author)
  createdMessages!: Message[];

  @OneToMany(() => ChatParticipant, ({ user }) => user)
  participantOfChats!: ChatParticipant[];

  @OneToMany(() => ForwardedMessage, ({ forwardedBy }) => forwardedBy)
  forwardedMessages!: ForwardedMessage[];
}

export { User, META as USER_META };
