import type { MigrationInterface, QueryRunner } from "typeorm";

import { getBoundSql } from "../utils";

export class MakeChatNameColumnNullable1753929546771 implements MigrationInterface {
  name = "MakeChatNameColumnNullable1753929546771";

  async up(queryRunner: QueryRunner): Promise<void> {
    const sql = getBoundSql(queryRunner);

    await sql`
      ALTER TABLE "chats"
      ALTER COLUMN "name"
      DROP NOT NULL
    `;
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const sql = getBoundSql(queryRunner);

    await sql`
      ALTER TABLE "chats"
      ALTER COLUMN "name"
      SET NOT NULL
    `;
  }
}
