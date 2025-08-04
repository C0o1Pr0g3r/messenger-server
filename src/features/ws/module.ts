import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/module";

import { EventGateway } from "./event-gateway";

@Module({
  imports: [AuthModule],
  providers: [EventGateway],
  exports: [EventGateway],
})
export class WsModule {}
