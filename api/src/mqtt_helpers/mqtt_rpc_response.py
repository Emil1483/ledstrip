import json


class MQTTRPCResponse:
    def __init__(self, message: bytes, status_code: int) -> None:
        self.message = message
        self.status_code = status_code

    def __str__(self) -> str:
        return f"{self.status_code}: {self.message}"

    def to_payload(self) -> bytes:
        return json.dumps(
            {
                "message": self.message,
                "status_code": self.status_code,
            }
        ).encode("utf-8")

    @classmethod
    def from_payload(cls, payload: bytes):
        data = json.loads(payload.decode("utf-8"))
        return cls(data["message"], data["status_code"])
