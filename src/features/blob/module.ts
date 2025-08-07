import { Module } from "@nestjs/common";

import { BlobService } from "./service";

@Module({
  providers: [BlobService],
  exports: [BlobService],
})
export class BlobModule {}
