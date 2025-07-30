import { Module } from "@nestjs/common";

import { UserModule } from "../user/module";

import { AuthController } from "./controller";
import { AuthService } from "./service";

@Module({
  imports: [UserModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
