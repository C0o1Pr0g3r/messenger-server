import type { WebSocket } from "ws";

import type { Incoming } from "./message";

function createWsEventName<T extends string>(eventName: T) {
  return `ws.${eventName}`;
}

type EventPayload<T extends Incoming.MessageType> = Pick<
  Extract<
    Incoming.Message,
    {
      type: T;
    }
  >,
  "data"
> & {
  client: WebSocket;
};

export { createWsEventName };
export type { EventPayload };
