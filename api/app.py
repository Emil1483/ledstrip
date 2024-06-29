import json
from os import getenv
from time import time

from src.mqtt_helpers.mqtt_wrapper import MQTTWrapper
from src.mqtt_helpers.mqtt_rpc_error import MQTTRPCError
from src.mqtt_helpers.mqtt_rpc_response import MQTTRPCResponse
from src.mqtt_helpers.mqtt_rpc_server import MQTTRPCServer
from src.logging_helper import logger
from src.modes.mode_service import ModeService, UnexpectedKwarg
from src.ledstrip_services.ledstrip_service import ledstrip_service

MQTT_HOST = getenv("MQTT_HOST")
MQTT_PORT = int(getenv("MQTT_PORT", "1883"))
assert MQTT_HOST is not None, "MQTT_HOST environment variable must be set"


if __name__ == "__main__":
    mode_service = ModeService()

    lights_mqtt_rpc = MQTTRPCServer("lights")

    with MQTTWrapper(MQTT_HOST, port=MQTT_PORT) as mqtt:
        logger.info(f"MQTT Server running")

        @lights_mqtt_rpc.register("set_mode")
        def set_mode(payload: bytes):
            try:
                payload_dict = json.loads(payload.decode("utf-8"))
                mode = payload_dict["mode"]
                kwargs = payload_dict.get("kwargs", {})

                mode_service.set_mode(mode, **kwargs)

                payload = json.dumps(mode_service.status())
                mqtt.client.publish("lights/status", payload, retain=True)
                logger.info(f"Published message {payload} to topic lights/status")

                return MQTTRPCResponse(f"Set mode to {mode}", 200)

            except UnexpectedKwarg as e:
                raise MQTTRPCError(
                    MQTTRPCResponse(f"Unknown kwarg: {e.unexpected_kwarg}", 400)
                )

        lights_mqtt_rpc.start(mqtt.client)

        payload = json.dumps(mode_service.status())
        mqtt.client.publish("lights/status", payload, retain=True)
        logger.info(f"Published message {payload} to topic lights/status")

        try:
            t = time()
            while True:
                now = time()
                dt = now - t
                t = now

                mode_service.transitioner.update_lights(ledstrip_service, dt)

        finally:
            print("Server stopped")
            ledstrip_service.fill((0, 0, 0))
            ledstrip_service.show()
            ledstrip_service.teardown()
