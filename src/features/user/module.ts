import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserService } from "./service";

import { Typeorm } from "~/infra";

@Module({
  imports: [TypeOrmModule.forFeature([Typeorm.Model.User])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
