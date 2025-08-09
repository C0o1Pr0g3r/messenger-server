import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { toColumnOptions } from "../utils";

import { ChatParticipant } from "./chat-participant";
import { ForwardedMessage } from "./forwarded-message";
import { LifeCycleDates } from "./life-cycle-dates";
import { Message } from "./message";
import { User } from "./user";

import * as domain from "~/domain";

const META = {
  tableName: "chats",
  constraints: {
    link: "chats_link_unique",
  },
};

@Entity(META.tableName)
class Chat {
  @PrimaryGeneratedColumn("identity")
  id!: number;

  @Column({
    ...toColumnOptions(domain.Chat.zPolylogueSchema.shape.name),
    nullable: true,
  })
  name!: string | null;

  @Column({
    ...toColumnOptions(domain.Chat.zPolylogueSchema.shape.link),
    nullable: true,
  })
  @Index(META.constraints.link, {
    unique: true,
  })
  link!: string | null;

  @Column({
    ...toColumnOptions(domain.Chat.Attribute.Type.zSchema),
    enumName: "chat_type",
  })
  type!: domain.Chat.Attribute.Type.Schema;

  @Column(() => LifeCycleDates, {
    prefix: false,
  })
  lifeCycleDates!: LifeCycleDates;

  @ManyToOne(() => User, ({ createdChats }) => createdChats, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "author_id",
  })
  author!: User;

  @ManyToOne(() => User, ({ interlocutorOfChats }) => interlocutorOfChats, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "interlocutor_id",
  })
  interlocutor!: User;

  @OneToMany(() => Message, ({ chat }) => chat)
  messages!: Message[];

  @OneToMany(() => ForwardedMessage, ({ chat }) => chat)
  forwardedMessages!: ForwardedMessage[];

  @OneToMany(() => ChatParticipant, ({ chat }) => chat)
  participants!: ChatParticipant[];
}

export { Chat, META as CHAT_META };
