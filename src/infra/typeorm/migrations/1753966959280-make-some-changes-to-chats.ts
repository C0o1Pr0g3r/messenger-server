import type { MigrationInterface, QueryRunner } from "typeorm";

import { getBoundSql } from "../utils";

export class MakeSomeChangesToChats1753966959280 implements MigrationInterface {
  name = "MakeSomeChangesToChats1753966959280";

  async up(queryRunner: QueryRunner): Promise<void> {
    const sql = getBoundSql(queryRunner);

    await sql`
      CREATE TABLE "chat_participants" (
        "chat_id" INTEGER NOT NULL,
        "user_id" INTEGER NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "chat_participants_chat_id_user_id_pk" PRIMARY KEY ("chat_id", "user_id")
      )
    `;
    await sql`
      ALTER TABLE "chats"
      ALTER COLUMN "name"
      DROP NOT NULL
    `;
    await sql`
      ALTER TABLE "chats"
      ALTER COLUMN "link"
      DROP NOT NULL
    `;
    await sql`
      ALTER TABLE "chat_participants"
      ADD CONSTRAINT "FK_9946d299e9ccfbee23aa40c5545" FOREIGN key ("chat_id") REFERENCES "chats" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `;
    await sql`
      ALTER TABLE "chat_participants"
      ADD CONSTRAINT "FK_b4129b3e21906ca57b503a1d834" FOREIGN key ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `;
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const sql = getBoundSql(queryRunner);

    await sql`
      ALTER TABLE "chat_participants"
      DROP CONSTRAINT "FK_b4129b3e21906ca57b503a1d834"
    `;
    await sql`
      ALTER TABLE "chat_participants"
      DROP CONSTRAINT "FK_9946d299e9ccfbee23aa40c5545"
    `;
    await sql`
      ALTER TABLE "chats"
      ALTER COLUMN "link"
      SET NOT NULL
    `;
    await sql`
      ALTER TABLE "chats"
      ALTER COLUMN "name"
      SET NOT NULL
    `;
    await sql`DROP TABLE "chat_participants"`;
  }
}
