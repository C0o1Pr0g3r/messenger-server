import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BlobNotFoundError, del, put } from "@vercel/blob";
import { function as function_, taskEither } from "fp-ts";

import { NotFoundError } from "./error";

import { UnexpectedError } from "~/common";
import { Config } from "~/infra";

@Injectable()
export class BlobService {
  constructor(private readonly configService: ConfigService<Config.Config, true>) {}

  upload(file: File): taskEither.TaskEither<UnexpectedError, string> {
    return function_.pipe(
      taskEither.tryCatch(
        () =>
          put(file.name, file, {
            access: "public",
            addRandomSuffix: true,
            token: this.configService.get("vercel", {
              infer: true,
            }).blobReadWriteToken,
          }),
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.map(({ url }) => url),
    );
  }

  delete(url: string): taskEither.TaskEither<UnexpectedError | NotFoundError, void> {
    return taskEither.tryCatch(
      () =>
        del(url, {
          token: this.configService.get("vercel", {
            infer: true,
          }).blobReadWriteToken,
        }),
      (reason) => {
        if (reason instanceof BlobNotFoundError) {
          return new NotFoundError(url);
        }
        return new UnexpectedError(reason);
      },
    );
  }
}
