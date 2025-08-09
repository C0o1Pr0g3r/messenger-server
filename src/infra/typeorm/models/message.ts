import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { toColumnOptions } from "../utils";

import { Chat } from "./chat";
import { ForwardedMessage } from "./forwarded-message";
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

  @Column(toColumnOptions(domain.Message.zOriginalSchema.shape.text))
  text!: string;

  @Column(() => LifeCycleDates, {
    prefix: false,
  })
  lifeCycleDates!: LifeCycleDates;

  @ManyToOne(() => User, ({ createdMessages }) => createdMessages, {
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

  @OneToMany(() => ForwardedMessage, ({ message }) => message)
  forwarding!: ForwardedMessage[];
}

export { Message, META as MESSAGE_META };
