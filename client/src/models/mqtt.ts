export interface MQTTMessage<T> {
    topic: string;
    message: T;
}

export type MessageToWS =
    | {
          method: "subscribe";
          topic: string;
          requestId: string;
      }
    | {
          method: "unsubscribe";
          topic: string;
          requestId: string;
      }
    | {
          method: "publish";
          topic: string;
          message: string;
          requestId: string;
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
      };
