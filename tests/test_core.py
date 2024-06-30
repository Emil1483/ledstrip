# python -m unittest tests.test_core

import os
from queue import Empty, Queue
import re
from time import sleep
import traceback
from typing import Any, Callable
import unittest
import tarfile
import io
import requests
import logging
import wrapt
from dotenv import load_dotenv
import pygit2

from testcontainers.core.config import testcontainers_config as config
from testcontainers.postgres import PostgresContainer
from testcontainers.core.container import DockerContainer, inside_container
from docker.models.containers import ExecResult
from pathspec import PathSpec


from api.src.mqtt_helpers.mqtt_wrapper import MQTTWrapper
from tests.djup_path import DjupPath

logging.basicConfig(level=logging.INFO)


load_dotenv()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_PEM_PUBLIC_KEY = os.getenv("CLERK_PEM_PUBLIC_KEY")
TEST_USER_EMAIL = os.getenv("TEST_USER_EMAIL")
TEST_USER_PASSWORD = os.getenv("TEST_USER_PASSWORD")

assert CLERK_SECRET_KEY is not None, "Environment variable CLERK_SECRET_KEY is required"
assert TEST_USER_EMAIL is not None, "Environment variable TEST_USER_EMAIL is required"
assert (
    CLERK_PEM_PUBLIC_KEY is not None
), "Environment variable CLERK_PEM_PUBLIC_KEY is required"
assert (
    TEST_USER_PASSWORD is not None
), "Environment variable TEST_USER_PASSWORD is required"


class LogNotFoundError(Exception):
    pass


def pathspec_from_gitignores(gitignore_paths: list[DjupPath]) -> PathSpec:
    patterns = []
    for gitignore_path in gitignore_paths:
        with open(gitignore_path) as f:
            patterns.extend(f.read().splitlines())
    return PathSpec.from_lines("gitwildmatch", patterns)


def make_tar_archive(src_path: DjupPath, ignore_spec: PathSpec):
    tar_stream = io.BytesIO()

    with tarfile.open(fileobj=tar_stream, mode="w") as tar:
        for path in ignore_spec.match_tree_files(root=src_path, negate=True):
            tar.add(src_path / path, arcname=path)

    tar_stream.seek(0)
    return tar_stream


def djup_wait_container_is_ready(*transient_exceptions) -> Callable:
    """
    Wait until container is ready.

    Function that spawn container should be decorated by this method Max wait is configured by
    config. Default is 120 sec. Polling interval is 1 sec.

    Args:
        *transient_exceptions: Additional transient exceptions that should be retried if raised. Any
            non-transient exceptions are fatal, and the exception is re-raised immediately.
    """
    transient_exceptions = (TimeoutError, ConnectionError) + tuple(transient_exceptions)

    @wrapt.decorator
    def wrapper(wrapped: Callable, instance: Any, args: list, kwargs: dict) -> Any:
        from testcontainers.core.container import DockerContainer

        if isinstance(instance, DockerContainer):
            logging.info(
                "Waiting for container %s with image %s to be ready ...",
                instance._container,
                instance.image,
            )
        else:
            logging.info("Waiting for %s to be ready ...", instance)

        exception = None
        for attempt_no in range(config.max_tries):
            if isinstance(instance, DockerContainer):
                instance.get_wrapped_container().reload()
                status = instance.get_wrapped_container().status
                if status == "exited":
                    stderr, stdout = instance.get_logs()
                    raise RuntimeError(
                        f"Container exited with logs\n{stdout.decode()}\n{stderr.decode()}"
                    )
            try:
                return wrapped(*args, **kwargs)
            except transient_exceptions as e:
                logging.debug(
                    f"Connection attempt '{attempt_no + 1}' of '{config.max_tries + 1}' "
                    f"failed: {traceback.format_exc()}"
                )
                sleep(1)
                exception = e
        raise TimeoutError(
            f"Wait time ({config.timeout}s) exceeded for {wrapped.__name__}(args: {args}, kwargs: "
            f"{kwargs}). Exception: {exception}"
        )

    return wrapper


class DjupDockerContainer(DockerContainer):
    @djup_wait_container_is_ready()
    def get_exposed_port(self, port: int) -> str:
        mapped_port = self.get_docker_client().port(self._container.id, port)
        if inside_container():
            gateway_ip = self.get_docker_client().gateway_ip(self._container.id)
            host = self.get_docker_client().host()

            if gateway_ip == host:
                return port
        return mapped_port

    @djup_wait_container_is_ready(LogNotFoundError)
    def wait_for_logs(self, message: str):
        predicate = re.compile(message, re.MULTILINE).search
        stderr, stdout = self.get_logs()
        if not predicate(stdout.decode()) and not predicate(stderr.decode()):
            raise LogNotFoundError()

    def get_ip_address(self):
        container_id = self.get_wrapped_container().id
        return self.get_docker_client().bridge_ip(container_id)


class CypressContainer(DockerContainer):
    def __init__(self, image: str = "cypress/browsers:latest", **kwargs):
        super().__init__(image=image, **kwargs)
        self.with_command("tail -f /dev/null")

    def execute(self, command: str, workdir: str | None = None):
        logging.info(f"$ {command}")
        container = self.get_wrapped_container()
        response: ExecResult = container.exec_run(command, workdir=workdir)

        if response.exit_code != 0:
            raise RuntimeError(f"Command failed: {response.output.decode()}")

        logging.info(response.output.decode())
        return response

    def copy(self, src: DjupPath, dest: str, ignore_spec: PathSpec):
        logging.info(f"Copying {src} to {dest}")
        container = self.get_wrapped_container()

        container.put_archive(
            dest,
            make_tar_archive(src, ignore_spec),
        )


class DjupPostgresContainer(PostgresContainer):
    def start(self):
        super().start()
        self.public_url = self.get_connection_url()

        container_id = self.get_wrapped_container().id
        ip = self.get_docker_client().bridge_ip(container_id)
        self.exposed_port = self.get_exposed_port(self.port)
        self.private_url = self.get_connection_url(host=ip).replace(
            str(self.exposed_port), str(self.port)
        )


class MosquittoContainer(DjupDockerContainer):
    def __init__(self, image="eclipse-mosquitto:2.0.18"):
        super().__init__(image)
        self.with_exposed_ports(1883)
        self.with_exposed_ports(9001)
        self.with_volume_mapping(
            DjupPath.to_path_parent(__file__).parent() / "mosquitto.conf",
            "/mosquitto/config/mosquitto.conf",
        )

    def start(self):
        super().start()
        self.wait_for_logs("mosquitto version 2.0.18 running")

        self.port_1883 = self.get_exposed_port(1883)
        self.port_9001 = self.get_exposed_port(9001)


class ApiContainer(DjupDockerContainer):
    def __init__(self, tag: str, mosquitto_container: MosquittoContainer):
        super().__init__(image=f"superemil64/ledstrip-api:{tag}")
        self.with_env("LEDSTRIP_SERVICE", "canvas")

        self.mosquitto_container = mosquitto_container

    def start(self):
        super().start()

        self._wait_for_mqtt_message()

    @djup_wait_container_is_ready(Empty)
    def _wait_for_mqtt_message(self):
        with MQTTWrapper(
            host="localhost",
            port=int(self.mosquitto_container.port_1883),
        ) as mqtt:

            queue = Queue()

            mqtt.client.on_message = lambda *_: queue.put(True)
            mqtt.client.subscribe("lights/status")
            queue.get(timeout=1)


class ClientContainer(DjupDockerContainer):
    def __init__(self, tag: str):
        super().__init__(image=f"superemil64/ledstrip-client:{tag}")
        self.with_exposed_ports(3000)
        self.with_env("CLERK_SECRET_KEY", CLERK_SECRET_KEY)
        self.with_env("CLERK_PEM_PUBLIC_KEY", CLERK_PEM_PUBLIC_KEY)

    def start(self):
        super().start()
        self.port = self.get_exposed_port(3000)
        self.public_url = f"http://localhost:{self.port}"

        self.private_url = f"http://{self.get_ip_address()}:3000"

        self._connect()

    @djup_wait_container_is_ready(requests.exceptions.ConnectionError)
    def _connect(self):
        requests.get(self.public_url)


class TestCore(unittest.TestCase):
    def setUp(self) -> None:
        repo = pygit2.Repository(".")
        tag = repo.head.target
        logging.info(f"Running tests for tag {tag}")

        root_dir = DjupPath.to_path_parent(__file__).parent()
        client_dir = root_dir / "client"

        self.postgres = DjupPostgresContainer(driver=None)
        self.mosquotto_container = MosquittoContainer()
        self.cypress_container = CypressContainer()
        self.api_container = ApiContainer(
            tag,
            mosquitto_container=self.mosquotto_container,
        )
        self.client_container = ClientContainer(tag)

        try:
            self.postgres.start()
            self.mosquotto_container.start()

            self.api_container.with_env(
                "MQTT_HOST",
                self.mosquotto_container.get_ip_address(),
            )

            self.api_container.start()

            self.client_container.with_env("DATABASE_URL", self.postgres.private_url)
            self.client_container.with_env(
                "MQTT_URL",
                f"ws://{self.mosquotto_container.get_ip_address()}:9001",
            )
            self.client_container.start()

            self.cypress_container.with_env("DATABASE_URL", self.postgres.private_url)
            self.cypress_container.with_env(
                "BASE_URL", self.client_container.private_url
            )
            self.cypress_container.with_env("CYPRESS_TEST_USER_EMAIL", TEST_USER_EMAIL)
            self.cypress_container.with_env(
                "CYPRESS_TEST_USER_PASSWORD", TEST_USER_PASSWORD
            )
            self.cypress_container.start()

            self.cypress_container.execute("mkdir /client")

            git_ignores = [client_dir / ".gitignore", root_dir / ".gitignore"]
            gitignore_pathspec = pathspec_from_gitignores(git_ignores)
            self.cypress_container.copy(client_dir, "/client", gitignore_pathspec)

            self.cypress_container.execute("npm install", workdir="/client")
            self.cypress_container.execute("npx prisma db push", workdir="/client")
        except Exception as e:
            self.tearDown()
            raise e

    def tearDown(self):
        self.postgres.stop()
        self.cypress_container.stop()
        self.api_container.stop()
        self.client_container.stop()

    def test_with_cypress(self):
        self.cypress_container.execute("npm run cy:run", workdir="/client")


if __name__ == "__main__":
    unittest.main()
