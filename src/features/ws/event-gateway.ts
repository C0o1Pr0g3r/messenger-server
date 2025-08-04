import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { OnGatewayConnection, WebSocketGateway } from "@nestjs/websockets";
import { either } from "fp-ts";
import { WebSocket } from "ws";

import { AuthService } from "../auth/service";

import { Incoming, Outgoing } from "./message";
import { createWsEventName, EventPayload } from "./ws-events";

import * as domain from "~/domain";

@WebSocketGateway()
class EventGateway implements OnGatewayConnection {
  private readonly clients: Set<WebSocket>;
  private readonly authenticatedClients: Map<domain.User.Schema["id"], Set<WebSocket>>;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly authService: AuthService,
  ) {
    this.clients = new Set();
    this.authenticatedClients = new Map();
  }

  handleConnection(client: WebSocket) {
    this.clients.add(client);

    client.on("close", () => this.clients.delete(client));

    client.on("message", (rawData: Buffer, isBinary) => {
      if (isBinary) return;

      try {
        const { type, data } = Incoming.zMessage.parse(JSON.parse(rawData.toString()));
        this.eventEmitter.emit(createWsEventName(type), {
          data,
          client,
        } satisfies EventPayload<typeof type>);
      } catch (error) {
        console.error("Failed to process incoming message.", rawData);
        console.error("Raw data:", rawData);
        console.error(error);
      }
    });
  }

  @OnEvent(createWsEventName(Incoming.MessageType.Token))
  async handleTokenMessage({ data, client }: EventPayload<typeof Incoming.MessageType.Token>) {
    const verificationResult = await this.authService.verifyJwt(data)();
    if (either.isLeft(verificationResult)) return;

    const { userId } = verificationResult.right;
    if (this.authenticatedClients.has(userId)) {
      this.authenticatedClients.get(userId)?.add(client);
    } else {
      this.authenticatedClients.set(userId, new Set([client]));
    }
    client.on("close", () => this.authenticatedClients.get(userId)?.delete(client));
  }

  sendMessage(message: Outgoing.Message, toUserIDs: domain.User.Schema["id"][]) {
    const stringifiedMessage = JSON.stringify(message);
    for (const userId of toUserIDs) {
      for (const client of this.authenticatedClients.get(userId) ?? []) {
        client.send(stringifiedMessage);
      }
    }
  }
}

export { EventGateway };
