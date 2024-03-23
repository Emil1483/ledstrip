import { getModes, setMode } from "../src/services/modes";

describe("Mode Service", () => {
    test("getModes", async () => {
        const modes = await getModes();
        expect(modes).toBeDefined();

        console.log("getModes() returns", modes);

        const onCount = Object.values(modes).reduce(
            (acc, item) => acc + (item.on ? 1 : 0),
            0
        );

        expect(onCount).toBe(1);
    });

    test("setMode", async () => {
        const modes = await getModes();
        const mode = Object.keys(modes)[0];
        const kwargs = modes[mode].kwargs;
        const payload = {
            mode,
            kwargs: Object.fromEntries(
                Object.entries(kwargs).map(([key, value]) => {
                    switch (value) {
                        case "float":
                            return [key, 1.0];
                        case "int":
                            return [key, 1];
                        case "str":
                            return [key, "foo"];
                        default:
                            throw new Error("Invalid type");
                    }
                })
            ),
        };

        const response = await setMode(payload);
        expect(response).toBeDefined();

        console.log(
            `setMode(${JSON.stringify(payload)}) returns`,
            `"${response}"`
        );
    });
});
