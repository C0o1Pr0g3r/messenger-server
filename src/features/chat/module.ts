import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "../auth/module";

import { ChatController } from "./controller";
import { ChatService } from "./service";

import { Typeorm } from "~/infra";

@Module({
  imports: [TypeOrmModule.forFeature([Typeorm.Model.Chat]), AuthModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
