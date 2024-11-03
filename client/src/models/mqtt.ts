export interface MQTTMessage<T> {
    topic: string;
    message: T;
}

export type MessageToWS =
    | {
          method: "subscribe";
          topic: string;
          requestId: string | undefined;
      }
    | {
          method: "unsubscribe";
          topic: string;
          requestId: string | undefined;
      }
    | {
          method: "publish";
          topic: string;
          message: string;
          requestId: string | undefined;
      };

export type MessageFromWS =
    | ({
          type: "MQTTMessage";
      } & MQTTMessage<any>)
    | {
          type: "response";
          requestId: string;
          statusCode: number;
          response: string;
      }
    | {
          type: "MQTTReady";
      }
    | {
          type: "error";
          error: string;
      };
