from .mqtt_rpc_response import MQTTRPCResponse


class MQTTRPCError(Exception):
    def __init__(self, response: MQTTRPCResponse) -> None:
        self.response = response

        assert response.status_code >= 400

    @classmethod
    def unknown_function(cls, function_name: str) -> "MQTTRPCResponse":
        return cls(MQTTRPCResponse(f"Unknown RPC function: {function_name}", 400))
