import json
from os import getenv
from time import time

from api.src.mqtt_helpers.mqtt_wrapper import MQTTWrapper
from api.src.mqtt_helpers.mqtt_rpc_error import MQTTRPCError
from api.src.mqtt_helpers.mqtt_rpc_response import MQTTRPCResponse
from api.src.mqtt_helpers.mqtt_rpc_server import MQTTRPCServer
from api.src.logging_helper import logger
from api.src.modes.mode_service import ModeService, UnexpectedKwarg
from api.src.ledstrip_services.ledstrip_service import ledstrip_service

MQTT_HOST = getenv("MQTT_HOST")
MQTT_PORT = int(getenv("MQTT_PORT", "1883"))
MQTT_USERNAME = getenv("MQTT_USERNAME")
MQTT_PASSWORD = getenv("MQTT_PASSWORD")
MQTT_TLS = getenv("MQTT_TLS", "false").lower() == "true"
LEDSTRIP_ID = getenv("LEDSTRIP_ID")

assert MQTT_HOST is not None, "MQTT_HOST environment variable must be set"
assert LEDSTRIP_ID is not None, "LEDSTRIP_ID environment variable must be set"


if __name__ == "__main__":
    mode_service = ModeService()

    lights_mqtt_rpc = MQTTRPCServer(f"lights/{LEDSTRIP_ID}")

    with MQTTWrapper(
        MQTT_HOST,
        port=MQTT_PORT,
        username=MQTT_USERNAME,
        password=MQTT_PASSWORD,
        use_tls=MQTT_TLS,
    ) as mqtt:
        logger.info("MQTT Server running")

        @lights_mqtt_rpc.register("set_mode")
        def set_mode(mode: str, kwargs: dict):
            try:
                mode_service.set_mode(mode, **kwargs)

                payload = json.dumps(mode_service.status())
                mqtt.client.publish(
                    f"lights/{LEDSTRIP_ID}/status", payload, retain=True
                )
                logger.info(
                    f"Published message {payload} to topic lights/{LEDSTRIP_ID}/status"
                )

                return MQTTRPCResponse(f"Set mode to {mode}", 200)

            except UnexpectedKwarg as e:
                raise MQTTRPCError(
                    MQTTRPCResponse(f"Unknown kwarg: {e.unexpected_kwarg}", 400)
                )

        lights_mqtt_rpc.start(mqtt.client)

        try:
            last_health_update = 0
            last_started_rpc_server = 0
            last_published_status = 0
            t = time()
            while True:
                if time() - last_published_status > 60:
                    last_published_status = time()
                    payload = json.dumps(mode_service.status())
                    topic = f"lights/{LEDSTRIP_ID}/status"
                    mqtt.client.publish(topic, payload, retain=True)
                    logger.info(f"Published message {payload} to topic {topic}")

                if time() - last_started_rpc_server > 3600:
                    last_started_rpc_server = time()
                    lights_mqtt_rpc.start(mqtt.client)

                if time() - last_health_update > 2:
                    last_health_update = time()
                    mqtt.client.publish(
                        f"lights/{LEDSTRIP_ID}/health",
                        json.dumps(dict(alive_at=last_health_update)),
                        retain=True,
                    )

                    logger.info(
                        f"Published health update to topic lights/{LEDSTRIP_ID}/health"
                    )

                now = time()
                dt = now - t
                t = now

                mode_service.transitioner.update_lights(ledstrip_service, dt)

        finally:
            print("Server stopped")
            ledstrip_service.fill((0, 0, 0))
            ledstrip_service.show()
            ledstrip_service.teardown()
