import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { config } from "dotenv";
import { expand } from "dotenv-expand";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
