import type { MigrationInterface, QueryRunner } from "typeorm";

import { getBoundSql } from "../utils";

export class AddInterlocutorColumnToChatTable1754092880394 implements MigrationInterface {
  name = "AddInterlocutorColumnToChatTable1754092880394";

  async up(queryRunner: QueryRunner): Promise<void> {
    const sql = getBoundSql(queryRunner);

    await sql`
      ALTER TABLE "chats"
      ADD "interlocutor_id" INTEGER
    `;
    await sql`
      ALTER TABLE "chats"
      ADD CONSTRAINT "FK_465341ceda15e080c9c2557fb38" FOREIGN key ("interlocutor_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `;
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const sql = getBoundSql(queryRunner);

    await sql`
      ALTER TABLE "chats"
      DROP CONSTRAINT "FK_465341ceda15e080c9c2557fb38"
    `;
    await sql`
      ALTER TABLE "chats"
      DROP COLUMN "interlocutor_id"
    `;
  }
}
