import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { toColumnOptions } from "../utils";

import { Chat } from "./chat";
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

  @OneToMany(() => Chat, ({ author }) => author)
  chats!: Chat[];

  @OneToMany(() => Message, ({ author }) => author)
  messages!: Message[];
}

export { User };
