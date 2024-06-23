from queue import Queue
import uuid
from paho.mqtt.client import Client, MQTT_ERR_SUCCESS, MQTTMessage


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
            *_, function_name, message_id = message.topic.split("/")

            if function_name not in self._functions:
                raise ValueError(f"Unknown RPC function: {function_name}")

            response = self._functions[function_name](message.payload)
            client.publish(
                f"{self.server_name}/rpc/response/{function_name}/{message_id}",
                response,
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
        return response.payload
