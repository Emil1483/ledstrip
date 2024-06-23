# python -m unittest tests.test_mqtt

import unittest

from src.mqtt_helpers.mqtt_rpc_server import MQTTRPCServer
from src.mqtt_helpers.mqtt_wrapper import MQTTWrapper

mqtt1_rpc = MQTTRPCServer("mqtt1")


@mqtt1_rpc.register("reverse_echo")  # foo = function name
def reverse_echo(payload: bytes):
    return payload.decode("UTF-8")[::-1]


class TestMQTT(unittest.TestCase):
    def test_mqtt(self):
        with MQTTWrapper("localhost") as mqtt1:
            mqtt1_rpc.start(mqtt1.client)

            with MQTTWrapper("localhost") as mqtt2:
                response = mqtt1_rpc.call(mqtt2.client, "reverse_echo", b"hello world")
                self.assertEqual(response, b"dlrow olleh")
