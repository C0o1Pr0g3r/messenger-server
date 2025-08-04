import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { WsAdapter } from "@nestjs/platform-ws";
import type { CorsOptions } from "cors";
import "reflect-metadata";

import { AppModule } from "./app.module";
import type { Config } from "./infra";
import { Http } from "./infra";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService<Config.Config, true>);

  app.enableCors({
    ...configService.get("cors", {
      infer: true,
    }),
    methods: [
      Http.Method.GET,
      Http.Method.PUT,
      Http.Method.PATCH,
      Http.Method.POST,
      Http.Method.DELETE,
    ],
  } satisfies CorsOptions);

  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(process.env["PORT"] ?? 3000);
}
void bootstrap();
