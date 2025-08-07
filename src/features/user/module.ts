import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "../auth/module";
import { BlobModule } from "../blob/module";

import { UserController } from "./controller";
import { UserService } from "./service";

import { Typeorm } from "~/infra";

@Module({
  imports: [
    TypeOrmModule.forFeature([Typeorm.Model.User]),
    forwardRef(() => AuthModule),
    BlobModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
