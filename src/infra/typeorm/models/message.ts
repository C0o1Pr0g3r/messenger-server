import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { toColumnOptions } from "../utils";

import { Chat } from "./chat";
import { LifeCycleDates } from "./life-cycle-dates";
import { User } from "./user";

import * as domain from "~/domain";

const META = {
  tableName: "messages",
};

@Entity(META.tableName)
class Message {
  @PrimaryGeneratedColumn("identity")
  id!: number;

  @Column(toColumnOptions(domain.Message.zSchema.shape.text))
  text!: string;

  @Column(() => LifeCycleDates, {
    prefix: false,
  })
  lifeCycleDates!: LifeCycleDates;

  @ManyToOne(() => User, ({ messages }) => messages, {
    nullable: false,
  })
  @JoinColumn({
    name: "author_id",
  })
  author!: User;

  @ManyToOne(() => Chat, ({ messages }) => messages, {
    nullable: false,
  })
  @JoinColumn({
    name: "chat_id",
  })
  chat!: Chat;
}

export { Message, META as MESSAGE_META };
