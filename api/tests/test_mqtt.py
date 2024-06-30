# python -m unittest tests.test_mqtt

import unittest

from api.src.mqtt_helpers.mqtt_rpc_response import MQTTRPCResponse
from api.src.mqtt_helpers.mqtt_rpc_error import MQTTRPCError
from api.src.mqtt_helpers.mqtt_rpc_server import MQTTRPCServer
from api.src.mqtt_helpers.mqtt_wrapper import MQTTWrapper

mqtt1_rpc = MQTTRPCServer("mqtt1")


@mqtt1_rpc.register("reverse_echo")
def reverse_echo(payload: bytes):
    return MQTTRPCResponse(payload.decode("UTF-8")[::-1], 200)


@mqtt1_rpc.register("exceptional_function")
def exceptional_function(_: bytes):
    raise MQTTRPCError(MQTTRPCResponse("Something went wrong", 500))


class TestMQTT(unittest.TestCase):
    def test_mqtt(self):
        with MQTTWrapper("localhost") as mqtt1:
            mqtt1_rpc.start(mqtt1.client)

            with MQTTWrapper("localhost") as mqtt2:
                response = mqtt1_rpc.call(mqtt2.client, "reverse_echo", "hello world")
                self.assertEqual(response.message, "dlrow olleh")

    def test_mqtt_exception(self):
        with MQTTWrapper("localhost") as mqtt1:
            mqtt1_rpc.start(mqtt1.client)

            with MQTTWrapper("localhost") as mqtt2:
                with self.assertRaises(MQTTRPCError):
                    mqtt1_rpc.call(mqtt2.client, "unknown_function", b"hello world")

                with self.assertRaises(MQTTRPCError):
                    mqtt1_rpc.call(mqtt2.client, "exceptional_function", b"")
