import type { MigrationInterface, QueryRunner } from "typeorm";

import { getBoundSql } from "../utils";

export class ConfigureCascadeDeletionOfRelatedEntities1754770467273 implements MigrationInterface {
  name = "ConfigureCascadeDeletionOfRelatedEntities1754770467273";

  async up(queryRunner: QueryRunner): Promise<void> {
    const sql = getBoundSql(queryRunner);

    await sql`
      ALTER TABLE "chat_participants"
      DROP CONSTRAINT "FK_9946d299e9ccfbee23aa40c5545"
    `;
    await sql`
      ALTER TABLE "chat_participants"
      DROP CONSTRAINT "FK_b4129b3e21906ca57b503a1d834"
    `;
    await sql`
      ALTER TABLE "messages"
      DROP CONSTRAINT "FK_05535bc695e9f7ee104616459d3"
    `;
    await sql`
      ALTER TABLE "messages"
      DROP CONSTRAINT "FK_7540635fef1922f0b156b9ef74f"
    `;
    await sql`
      ALTER TABLE "forwarded_messages"
      DROP CONSTRAINT "forwarded_messages_message_id_fk"
    `;
    await sql`
      ALTER TABLE "forwarded_messages"
      DROP CONSTRAINT "forwarded_messages_forwarded_by_id_fk"
    `;
    await sql`
      ALTER TABLE "forwarded_messages"
      DROP CONSTRAINT "forwarded_messages_chat_id_fk"
    `;
    await sql`
      ALTER TABLE "chats"
      DROP CONSTRAINT "FK_18c56584cf0275f0740c5ae8a2a"
    `;
    await sql`
      ALTER TABLE "chats"
      DROP CONSTRAINT "FK_465341ceda15e080c9c2557fb38"
    `;
    await sql`
      ALTER TABLE "chat_participants"
      ADD CONSTRAINT "FK_9946d299e9ccfbee23aa40c5545" FOREIGN key ("chat_id") REFERENCES "chats" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `;
    await sql`
      ALTER TABLE "chat_participants"
      ADD CONSTRAINT "FK_b4129b3e21906ca57b503a1d834" FOREIGN key ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `;
    await sql`
      ALTER TABLE "messages"
      ADD CONSTRAINT "FK_05535bc695e9f7ee104616459d3" FOREIGN key ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `;
    await sql`
      ALTER TABLE "messages"
      ADD CONSTRAINT "FK_7540635fef1922f0b156b9ef74f" FOREIGN key ("chat_id") REFERENCES "chats" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `;
    await sql`
      ALTER TABLE "forwarded_messages"
      ADD CONSTRAINT "forwarded_messages_message_id_fk" FOREIGN key ("message_id") REFERENCES "messages" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `;
    await sql`
      ALTER TABLE "forwarded_messages"
      ADD CONSTRAINT "forwarded_messages_forwarded_by_id_fk" FOREIGN key ("forwarded_by_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `;
    await sql`
      ALTER TABLE "forwarded_messages"
      ADD CONSTRAINT "forwarded_messages_chat_id_fk" FOREIGN key ("chat_id") REFERENCES "chats" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `;
    await sql`
      ALTER TABLE "chats"
      ADD CONSTRAINT "FK_18c56584cf0275f0740c5ae8a2a" FOREIGN key ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `;
    await sql`
      ALTER TABLE "chats"
      ADD CONSTRAINT "FK_465341ceda15e080c9c2557fb38" FOREIGN key ("interlocutor_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
      DROP CONSTRAINT "FK_18c56584cf0275f0740c5ae8a2a"
    `;
    await sql`
      ALTER TABLE "forwarded_messages"
      DROP CONSTRAINT "forwarded_messages_chat_id_fk"
    `;
    await sql`
      ALTER TABLE "forwarded_messages"
      DROP CONSTRAINT "forwarded_messages_forwarded_by_id_fk"
    `;
    await sql`
      ALTER TABLE "forwarded_messages"
      DROP CONSTRAINT "forwarded_messages_message_id_fk"
    `;
    await sql`
      ALTER TABLE "messages"
      DROP CONSTRAINT "FK_7540635fef1922f0b156b9ef74f"
    `;
    await sql`
      ALTER TABLE "messages"
      DROP CONSTRAINT "FK_05535bc695e9f7ee104616459d3"
    `;
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
      ADD CONSTRAINT "FK_465341ceda15e080c9c2557fb38" FOREIGN key ("interlocutor_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `;
    await sql`
      ALTER TABLE "chats"
      ADD CONSTRAINT "FK_18c56584cf0275f0740c5ae8a2a" FOREIGN key ("author_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `;
    await sql`
      ALTER TABLE "forwarded_messages"
      ADD CONSTRAINT "forwarded_messages_chat_id_fk" FOREIGN key ("chat_id") REFERENCES "chats" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `;
    await sql`
      ALTER TABLE "forwarded_messages"
      ADD CONSTRAINT "forwarded_messages_forwarded_by_id_fk" FOREIGN key ("forwarded_by_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `;
    await sql`
      ALTER TABLE "forwarded_messages"
      ADD CONSTRAINT "forwarded_messages_message_id_fk" FOREIGN key ("message_id") REFERENCES "messages" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `;
    await sql`
      ALTER TABLE "messages"
      ADD CONSTRAINT "FK_7540635fef1922f0b156b9ef74f" FOREIGN key ("chat_id") REFERENCES "chats" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `;
    await sql`
      ALTER TABLE "messages"
      ADD CONSTRAINT "FK_05535bc695e9f7ee104616459d3" FOREIGN key ("author_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `;
    await sql`
      ALTER TABLE "chat_participants"
      ADD CONSTRAINT "FK_b4129b3e21906ca57b503a1d834" FOREIGN key ("user_id") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `;
    await sql`
      ALTER TABLE "chat_participants"
      ADD CONSTRAINT "FK_9946d299e9ccfbee23aa40c5545" FOREIGN key ("chat_id") REFERENCES "chats" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `;
  }
}
