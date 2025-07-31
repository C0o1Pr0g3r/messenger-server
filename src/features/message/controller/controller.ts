import { Controller, Get, UseGuards } from "@nestjs/common";
import { function as function_ } from "fp-ts";

import { MessageService, MessageServiceIos } from "../service";

import { GetMine } from "./ios";

import { Fp } from "~/common";
import { AuthGuard } from "~/features/auth/auth.guard";
import { CurrentUser, RequestWithUser } from "~/features/auth/current-user.decorator";

@Controller("messages")
class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get("getallmessages")
  @UseGuards(AuthGuard)
  async getByEmailOrNickname(
    @CurrentUser() user: RequestWithUser["user"],
  ): Promise<GetMine.ResBody> {
    return Fp.throwify(
      await function_.pipe(
        this.messageService.getMine({
          userId: user.id,
        }),
      )(),
    ).map(mapMessage);
  }
}

function mapMessage({ id, text, createdAt, authorId, chatId }: MessageServiceIos.Common.Out) {
  return {
    id_message: id,
    text_message: text,
    data_time: createdAt,
    rk_user: authorId,
    rk_chat: chatId,
  };
}

export { MessageController };
