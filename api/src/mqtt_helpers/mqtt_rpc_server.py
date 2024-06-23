from queue import Queue
import uuid
from paho.mqtt.client import Client, MQTT_ERR_SUCCESS, MQTTMessage

from .mqtt_rpc_response import MQTTRPCResponse
from .mqtt_rpc_error import MQTTRPCError


class MQTTRPCServer:
    def __init__(self, server_name: str):
        self.server_name = server_name
        self._functions = {}

    def register(self, function_name):
        def decorator(func):
            self._functions[function_name] = func
            return func

        return decorator

    def start(self, client: Client):
        def on_message(_, __, message):
            try:
                *_, function_name, message_id = message.topic.split("/")

                if function_name not in self._functions:
                    raise MQTTRPCError.unknown_function(
                        f"Unknown RPC function: {function_name}"
                    )

                response = self._functions[function_name](message.payload)
                assert isinstance(response, MQTTRPCResponse)

                client.publish(
                    f"{self.server_name}/rpc/response/{function_name}/{message_id}",
                    response.to_payload(),
                )

            except MQTTRPCError as e:
                client.publish(
                    f"{self.server_name}/rpc/response/{function_name}/{message_id}",
                    e.response.to_payload(),
                )

        client.on_message = on_message
        client.subscribe(f"{self.server_name}/rpc/request/#")

    def call(self, client: Client, function_name: str, payload: bytes):
        message_id = str(uuid.uuid4())
        status, _ = client.subscribe(
            f"{self.server_name}/rpc/response/{function_name}/{message_id}"
        )

        if status != MQTT_ERR_SUCCESS:
            raise ValueError(f"Failed to subscribe to response topic: {status}")

        queue: Queue[MQTTMessage] = Queue(1)
        client.on_message = lambda _, __, message: queue.put(message)

        client.publish(
            f"{self.server_name}/rpc/request/{function_name}/{message_id}",
            payload,
        )

        response = queue.get()

        rpc_response = MQTTRPCResponse.from_payload(response.payload)

        if rpc_response.status_code >= 400:
            raise MQTTRPCError(rpc_response)

        return rpc_response
