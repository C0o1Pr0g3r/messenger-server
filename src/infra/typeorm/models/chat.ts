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
  id: number;

  @Column(toColumnOptions(domain.Chat.zSchema.shape.name))
  name: string;

  @Column(toColumnOptions(domain.Chat.zSchema.shape.link))
  @Index(META.constraints.link, {
    unique: true,
  })
  link: string;

  @Column({
    ...toColumnOptions(domain.Chat.zSchema.shape.type),
    enumName: "chat_type",
  })
  type: domain.Chat.Attribute.Type.Schema;

  @ManyToOne(() => User, ({ chats }) => chats, {
    nullable: false,
  })
  @JoinColumn({
    name: "author_id",
  })
  author: User;

  @OneToMany(() => Message, ({ chat }) => chat)
  messages: Message[];
}

export { Chat };
