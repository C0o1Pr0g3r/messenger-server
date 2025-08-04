import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "../auth/module";
import { WsModule } from "../ws/module";

import { ChatController } from "./controller";
import { ChatService } from "./service";

import { Typeorm } from "~/infra";

@Module({
  imports: [
    TypeOrmModule.forFeature([Typeorm.Model.Chat, Typeorm.Model.ChatParticipant]),
    AuthModule,
    WsModule,
  ],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
