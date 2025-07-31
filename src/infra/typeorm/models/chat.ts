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
    ...toColumnOptions(domain.Chat.zSchema.shape.name),
    nullable: true,
  })
  name!: string | null;

  @Column(toColumnOptions(domain.Chat.zSchema.shape.link))
  @Index(META.constraints.link, {
    unique: true,
  })
  link!: string;

  @Column({
    ...toColumnOptions(domain.Chat.zSchema.shape.type),
    enumName: "chat_type",
  })
  type!: domain.Chat.Attribute.Type.Schema;

  @Column(() => LifeCycleDates, {
    prefix: false,
  })
  lifeCycleDates!: LifeCycleDates;

  @ManyToOne(() => User, ({ createdChats }) => createdChats, {
    nullable: false,
  })
  @JoinColumn({
    name: "author_id",
  })
  author!: User;

  @OneToMany(() => Message, ({ chat }) => chat)
  messages!: Message[];

  @OneToMany(() => ChatParticipant, ({ chat }) => chat)
  participants!: ChatParticipant[];
}

export { Chat, META as CHAT_META };
