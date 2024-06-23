import paho.mqtt.client as mqtt
from paho.mqtt.client import CallbackAPIVersion


class MQTTWrapper:
    def __init__(self, host: str, port=1883, keepalive=60):
        self.client = mqtt.Client(CallbackAPIVersion.VERSION2)
        self.host = host
        self.port = port
        self.keepalive = keepalive

    def connect(self):
        self.client.connect(self.host, self.port, self.keepalive)
        self.client.loop_start()

    def disconnect(self):
        self.client.disconnect()

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()
