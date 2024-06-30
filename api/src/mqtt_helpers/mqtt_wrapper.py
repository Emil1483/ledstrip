from time import sleep
from api.src.logging_helper import logger

import paho.mqtt.client as mqtt
from paho.mqtt.client import CallbackAPIVersion


class MQTTWrapper:
    def __init__(
        self,
        host: str,
        port=1883,
        keepalive=60,
        connect_timeout=1,
        username: str = None,
        password: str = None,
        use_tls=False,
    ):
        self.client = mqtt.Client(
            CallbackAPIVersion.VERSION2,
            protocol=mqtt.MQTTv5,
        )

        if username and password:
            self.client.username_pw_set(username, password)

        if use_tls:
            self.client.tls_set(tls_version=mqtt.ssl.PROTOCOL_TLS)

        self.client.connect_timeout = connect_timeout

        self.host = host
        self.port = port
        self.keepalive = keepalive

        self.connected_flag = False
        self.connected_error_flag = False

    def connect(self):
        logger.info(f"Connecting to MQTT server at {self.host}:{self.port}")

        def on_connect(*args):
            logger.info(f"Connected to MQTT server at {self.host}:{self.port}")
            self.connected_flag = True

        def on_connect_fail(*args):
            logger.error(f"Failed to connect to MQTT server at {self.host}:{self.port}")
            self.connected_error_flag = True

        def on_disconnect(*args):
            if self.connected_flag:
                return

            logger.error(f"Disconnected from MQTT server at {self.host}:{self.port}")
            self.connected_error_flag = True

        self.client.on_connect = on_connect
        self.client.on_connect_fail = on_connect_fail
        self.client.on_disconnect = on_disconnect
        self.client.loop_start()

        rc = self.client.connect(self.host, self.port, self.keepalive)
        if rc != mqtt.MQTT_ERR_SUCCESS:
            raise ConnectionError(
                f"Failed to connect to MQTT server at {self.host}:{self.port}"
            )

        while not self.connected_flag:
            if self.connected_error_flag:
                raise ConnectionError(
                    f"Failed to connect to MQTT server at {self.host}:{self.port}"
                )
            sleep(0.01)

    def disconnect(self):
        self.wilfully_disconnect = True
        self.client.disconnect()

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()
