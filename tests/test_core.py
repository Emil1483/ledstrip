# python -m unittest tests.test_core

import os
import unittest
import tarfile
import io

from dotenv import load_dotenv
import requests
from testcontainers.core.waiting_utils import wait_container_is_ready
from testcontainers.postgres import PostgresContainer
from testcontainers.core.container import DockerContainer
from docker.models.containers import ExecResult
from pathspec import PathSpec

import logging

from tests.djup_path import DjupPath

logging.basicConfig(level=logging.INFO)


load_dotenv()

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = os.getenv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

assert (
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not None
), "Environment variable NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"

assert CLERK_SECRET_KEY is not None, "Environment variable CLERK_SECRET_KEY is required"


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


class NodeContainer(DockerContainer):
    def __init__(self, image: str = "node:16", **kwargs):
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


class ApiContainer(DockerContainer):
    def __init__(self, tag: str):
        super().__init__(image=f"superemil64/ledstrip-api:{tag}")
        self.with_env("LEDSTRIP_SERVICE", "canvas")
        self.with_exposed_ports(8080)
        self.with_network_aliases("api")

    def start(self):
        super().start()
        self.port = self.get_exposed_port(8080)
        self.public_url = f"http://localhost:{self.port}"

        container_id = self.get_wrapped_container().id
        ip = self.get_docker_client().bridge_ip(container_id)
        self.private_url = f"http://{ip}:8080"

    @wait_container_is_ready(requests.exceptions.ConnectionError)
    def wait_until_ready(self):
        requests.get(self.public_url)


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


class ClientContainer(DockerContainer):
    def __init__(self, tag: str):
        super().__init__(image=f"superemil64/ledstrip-client:{tag}")
        self.with_exposed_ports(3000)
        self.with_env(
            "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        )
        self.with_env("CLERK_SECRET_KEY", CLERK_SECRET_KEY)
        self.with_env("NEXT_PUBLIC_CLERK_SIGN_IN_URL", "/sign-in")
        self.with_env("NEXT_PUBLIC_CLERK_SIGN_UP_URL", "/sign-up")

    def start(self):
        super().start()
        self.port = self.get_exposed_port(3000)
        self.public_url = f"http://localhost:{self.port}"

        container_id = self.get_wrapped_container().id
        ip = self.get_docker_client().bridge_ip(container_id)
        self.private_url = f"http://{ip}:3000"

    @wait_container_is_ready(requests.exceptions.ConnectionError)
    def wait_until_ready(self):
        requests.get(self.public_url)


class TestCore(unittest.TestCase):
    def setUp(self) -> None:
        tag = "main-b57d4ba"

        root_dir = DjupPath.to_path_parent(__file__).parent()
        client_dir = root_dir / "client"

        self.postgres = DjupPostgresContainer(driver=None)
        self.node_container = NodeContainer()
        self.api_container = ApiContainer(tag)
        self.client_container = ClientContainer(tag)

        try:
            self.postgres.start()

            self.api_container.start()
            self.api_container.wait_until_ready()

            self.client_container.with_env("API_URL", self.api_container.private_url)
            self.client_container.with_env("DATABASE_URL", self.postgres.private_url)
            self.client_container.start()
            self.client_container.wait_until_ready()

            self.node_container.with_env("DATABASE_URL", self.postgres.private_url)
            self.node_container.start()

            self.node_container.execute("mkdir /client")

            git_ignores = [client_dir / ".gitignore", root_dir / ".gitignore"]
            gitignore_pathspec = pathspec_from_gitignores(git_ignores)
            self.node_container.copy(client_dir, "/client", gitignore_pathspec)

            self.node_container.execute("npm install", workdir="/client")
            self.node_container.execute("npx prisma db push", workdir="/client")

            print(f"client is ready at {self.client_container.public_url}")
            print(f"client is ready at {self.client_container.public_url}")
            print(f"client is ready at {self.client_container.public_url}")
        except Exception as e:
            self.tearDown()
            raise e

    def tearDown(self):
        self.postgres.stop()
        self.node_container.stop()
        self.api_container.stop()
        self.client_container.stop()

    def test_postgres(self):
        print("hello world")


if __name__ == "__main__":
    unittest.main()
