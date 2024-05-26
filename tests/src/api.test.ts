import { GenericContainer, StartedTestContainer, Wait } from "testcontainers";

class ErrorLoggingContainer extends GenericContainer {
  public containerLogs: string;

  constructor(image: string) {
    super(image);

    this.containerLogs = "";
    this.withLogConsumer((stream) => {
      stream.on("data", (line) => (this.containerLogs += line.toString()));
      stream.on("err", (line) => (this.containerLogs += line.toString()));
    });
  }

  async start() {
    try {
      return await super.start();
    } catch (e) {
      console.error(this.containerLogs);
      throw e;
    }
  }
}

describe("Ledstrip API", () => {
  let container: StartedTestContainer;

  beforeAll(async () => {
    container = await new ErrorLoggingContainer(
      "superemil64/ledstrip-api:main-1246cf8"
    )
      .withExposedPorts(8080)
      .withWaitStrategy(Wait.forListeningPorts())
      .withEnvironment({
        LEDSTRIP_SERVICE: "canvas",
      })
      .start();
  }, 3 * 60 * 1000);

  afterAll(async () => {
    if (container) await container.stop();
  });

  it("starts", async () => {
    expect(container).toBeDefined();

    let logs = "";
    (await container.logs())
      .on("data", (line) => (logs += line))
      .on("end", () => console.log(logs));
  });
});
