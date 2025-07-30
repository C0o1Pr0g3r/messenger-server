import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserController } from "./controller";
import { UserService } from "./service";

import { Typeorm } from "~/infra";

@Module({
  imports: [TypeOrmModule.forFeature([Typeorm.Model.User])],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
