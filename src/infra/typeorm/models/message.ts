import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { toColumnOptions } from "../utils";

import { Chat } from "./chat";
import { User } from "./user";

import * as domain from "~/domain";

const META = {
  tableName: "messages",
};

@Entity(META.tableName)
class Message {
  @PrimaryGeneratedColumn("identity")
  id: number;

  @Column(toColumnOptions(domain.Message.zSchema.shape.text))
  text: string;

  @CreateDateColumn({
    type: "timestamp",
    name: "created_at",
  })
  createdAt: Date;

  @ManyToOne(() => User, ({ messages }) => messages, {
    nullable: false,
  })
  @JoinColumn({
    name: "author_id",
  })
  author: User;

  @ManyToOne(() => Chat, ({ messages }) => messages, {
    nullable: false,
  })
  @JoinColumn({
    name: "chat_id",
  })
  chat: Chat;
}

export { Message };
