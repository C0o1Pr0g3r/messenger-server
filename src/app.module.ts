import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_PIPE } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { TypeOrmModule } from "@nestjs/typeorm";
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { ZodValidationPipe } from "nestjs-zod";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./features/auth/module";
import { BlobModule } from "./features/blob/module";
import { ChatModule } from "./features/chat/module";
import { MessageModule } from "./features/message/module";
import { UserController } from "./features/user/controller";
import { UserModule } from "./features/user/module";
import { WsModule } from "./features/ws/module";
import { Config, Typeorm } from "./infra";

expand(config());

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: Config.createNestjsConfig(process.env),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config.Config, true>) => {
        return Typeorm.DataSource.defineOptions(configService.get("database"));
      },
    }),
    EventEmitterModule.forRoot(),
    UserModule,
    AuthModule,
    ChatModule,
    MessageModule,
    WsModule,
    BlobModule,
  ],
  controllers: [AppController, UserController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
