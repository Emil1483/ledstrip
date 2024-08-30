import json


class MQTTRPCRequest:
    def __init__(self, topic: str, kwargs: dict, reply_topic: str) -> None:
        self.topic = topic
        self.kwargs = kwargs
        self.reply_topic = reply_topic

    def __str__(self) -> str:
        kwargs = self.kwargs
        reply_topic = self.reply_topic
        return f"{kwargs=}, {reply_topic=}"

    def to_payload(self) -> bytes:
        return json.dumps(
            {
                "kwargs": self.kwargs,
                "reply_topic": self.reply_topic,
            }
        ).encode("utf-8")

    @classmethod
    def from_message(cls, message):
        data = json.loads(message.payload.decode("utf-8"))
        return cls(message.topic, data["kwargs"], data["reply_topic"])

    def publish(self, client):
        return client.publish(self.topic, self.to_payload())
