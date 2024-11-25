from queue import Queue
from time import perf_counter
import traceback
import uuid
from paho.mqtt.client import Client, MQTT_ERR_SUCCESS, MQTTMessage
from func_timeout import func_timeout, FunctionTimedOut

from api.src.logging_helper import logger

from .mqtt_rpc_response import MQTTRPCResponse
from .mqtt_rpc_error import MQTTRPCError
from .mqtt_rpc_request import MQTTRPCRequest


class ClientTimeoutError(TimeoutError):
    pass


class ServerTimeoutError(TimeoutError):
    pass


class InvalidResponse(Exception):
    def __init__(self, response):
        self.response = response


SERVER_TIMEOUT_STATUS_CODE = 512


class MQTTRPCServer:
    def __init__(self, topic_prefix: str, function_timeout=15):
        self.topic_prefix = topic_prefix
        self.function_timeout = function_timeout
        self._functions = {}

    def register(self, function_name: str):
        topic = f"{self.topic_prefix}/{function_name}"

        def decorator(func):
            self._functions[topic] = func
            return func

        return decorator

    def dispatch_function(self, request):
        func = self._functions[request.topic]
        try:
            response = func_timeout(
                timeout=self.function_timeout,
                func=func,
                kwargs=request.kwargs,
            )

            if not isinstance(response, MQTTRPCResponse):
                logger.error(
                    f"{request.topic} returned invalid response: {response}"
                    f"of type {type(response)}"
                )
                return MQTTRPCResponse(f"Invalid response: {e}", 500)
            return response
        except MQTTRPCError as e:
            logger.critical(f"{request.topic} returned MQTTRPCError response: {e}")
            return e.response
        except FunctionTimedOut as e:
            logger.error(f"{request.topic} raised FunctionTimedOut: {e}")
            return MQTTRPCResponse(str(e), SERVER_TIMEOUT_STATUS_CODE)
        except Exception as e:
            logger.error(f"{request.topic} raised {type(e)}: {e}")
            print(traceback.format_exc())
            return MQTTRPCResponse(f"{type(e)}: {e}", 500)

    def start(self, client: Client):
        for topic in self._functions:
            status, _ = client.subscribe(topic)
            if status != MQTT_ERR_SUCCESS:
                raise ValueError(
                    f"Failed to subscribe to topic: {topic}. status: {status}"
                )

            @client.topic_callback(topic)
            def handle_topic(_, __, message: MQTTMessage):
                logger.info(f"Received RPC request on topic: {message.topic}")
                request = MQTTRPCRequest.from_message(message)
                response = self.dispatch_function(request)
                if request.reply_topic is not None:
                    client.publish(request.reply_topic, response.to_payload())
                logger.info(f"Published RPC response to topic: {request.reply_topic}")

            logger.info(f"Registered RPC function to topic: {topic}")

    def call(self, client: Client, function_name: str, timeout=20, **kwargs):
        if client._in_callback_mutex.locked():
            raise RuntimeError(
                "Cannot call RPC function from within a callback context"
            )

        reply_topic = str(uuid.uuid4())
        status, _ = client.subscribe(reply_topic)

        if status != MQTT_ERR_SUCCESS:
            raise ValueError(
                f"Failed to subscribe to reply topic: {reply_topic}. Status: {status}"
            )

        queue: Queue[MQTTMessage] = Queue(1)

        @client.topic_callback(reply_topic)
        def handle_topic(_, __, message):
            queue.put(message)

        topic = f"{self.topic_prefix}/{function_name}"
        request = MQTTRPCRequest(topic, kwargs, reply_topic)
        request.publish(client)

        logger.info(
            f"Calling RPC function: {function_name}"
            f"({', '.join(f'{k}={v}' for k, v in kwargs.items())})"
            f" on topic: {topic}",
        )

        start = perf_counter()
        while queue.empty():
            if perf_counter() - start > timeout:
                raise ClientTimeoutError(
                    f"RPC call timed out after {timeout} seconds "
                    f"We were waiting for a response on topic: {reply_topic}"
                )

            if not client._thread:
                client.loop_read()

        client.message_callback_remove(reply_topic)
        result, _ = client.unsubscribe(reply_topic)
        if result != MQTT_ERR_SUCCESS:
            logger.error(
                f"Failed to unsubscribe from reply topic: {reply_topic} reason: {result}"
            )

        response = queue.get(block=False)

        rpc_response = MQTTRPCResponse.from_payload(response.payload)

        if rpc_response.status_code == SERVER_TIMEOUT_STATUS_CODE:
            raise ServerTimeoutError(rpc_response.message)

        if rpc_response.status_code >= 400:
            raise MQTTRPCError(rpc_response)

        return rpc_response
