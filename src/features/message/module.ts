import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "../auth/module";

import { MessageController } from "./controller";
import { MessageService } from "./service";

import { Typeorm } from "~/infra";

@Module({
  imports: [TypeOrmModule.forFeature([Typeorm.Model.Chat, Typeorm.Model.Message]), AuthModule],
  providers: [MessageService],
  controllers: [MessageController],
})
export class MessageModule {}
