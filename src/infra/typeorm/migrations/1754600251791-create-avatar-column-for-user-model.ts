import type { MigrationInterface, QueryRunner } from "typeorm";

import { getBoundSql } from "../utils";

export class CreateAvatarColumnForUserModel1754600251791 implements MigrationInterface {
  name = "CreateAvatarColumnForUserModel1754600251791";

  async up(queryRunner: QueryRunner): Promise<void> {
    const sql = getBoundSql(queryRunner);

    await sql`
      ALTER TABLE "users"
      ADD "avatar" TEXT
    `;
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const sql = getBoundSql(queryRunner);

    await sql`
      ALTER TABLE "users"
      DROP COLUMN "avatar"
    `;
  }
}
