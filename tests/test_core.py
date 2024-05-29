# python -m unittest tests.test_core

import os
import unittest
import tarfile
import io
import requests

from dotenv import load_dotenv
import pygit2
from testcontainers.core.waiting_utils import wait_container_is_ready
from testcontainers.postgres import PostgresContainer
from testcontainers.core.container import DockerContainer
from docker.models.containers import ExecResult
from pathspec import PathSpec

import logging

from tests.djup_path import DjupPath

logging.basicConfig(level=logging.INFO)


load_dotenv()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
TEST_USER_EMAIL = os.getenv("TEST_USER_EMAIL")
TEST_USER_PASSWORD = os.getenv("TEST_USER_PASSWORD")

assert CLERK_SECRET_KEY is not None, "Environment variable CLERK_SECRET_KEY is required"
assert TEST_USER_EMAIL is not None, "Environment variable TEST_USER_EMAIL is required"
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

        self._connect()

    @wait_container_is_ready(requests.exceptions.ConnectionError)
    def _connect(self):
        self.get_wrapped_container().reload()
        status = self.get_wrapped_container().status
        if status == "exited":
            stderr, stdout = self.get_logs()
            raise RuntimeError(
                f"Container exited with logs\n" f"{stdout.decode()}\n{stderr.decode()}"
            )

        requests.get(self.public_url)


class ClientContainer(DockerContainer):
    def __init__(self, tag: str):
        super().__init__(image=f"superemil64/ledstrip-client:{tag}")
        self.with_exposed_ports(3000)
        self.with_env("CLERK_SECRET_KEY", CLERK_SECRET_KEY)

    def start(self):
        super().start()
        self.port = self.get_exposed_port(3000)
        self.public_url = f"http://localhost:{self.port}"

        container_id = self.get_wrapped_container().id
        ip = self.get_docker_client().bridge_ip(container_id)
        self.private_url = f"http://{ip}:3000"

        self._connect()

    @wait_container_is_ready(requests.exceptions.ConnectionError)
    def _connect(self):
        self.get_wrapped_container().reload()
        status = self.get_wrapped_container().status
        if status == "exited":
            stderr, stdout = self.get_logs()
            raise RuntimeError(
                f"Container exited with logs\n" f"{stdout.decode()}\n{stderr.decode()}"
            )

        requests.get(self.public_url)


class TestCore(unittest.TestCase):
    def setUp(self) -> None:
        repo = pygit2.Repository(".")
        tag = repo.head.target
        logging.info(f"Running tests for tag {tag}")

        root_dir = DjupPath.to_path_parent(__file__).parent()
        client_dir = root_dir / "client"

        self.postgres = DjupPostgresContainer(driver=None)
        self.cypress_container = CypressContainer()
        self.api_container = ApiContainer(tag)
        self.client_container = ClientContainer(tag)

        try:
            self.postgres.start()

            self.api_container.start()

            self.client_container.with_env("API_URL", self.api_container.private_url)
            self.client_container.with_env("DATABASE_URL", self.postgres.private_url)
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
