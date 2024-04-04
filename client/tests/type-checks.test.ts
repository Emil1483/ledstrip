import { isColor } from "../src/models/typeCheckers";

describe("Check that we can check if data implements custom interfaces", () => {
    test("isColor", () => {
        const color: Color = { r: 0, g: 0, b: 0 };
        expect(isColor(color)).toBe(true);
        console.log(`isColor(${JSON.stringify(color)}) returns`, true);

        expect(isColor({ foo: "bar" })).toBe(false);
        expect(isColor({ r: 0, g: 0 })).toBe(false);
        expect(isColor({ r: 0, g: 0, b: 0, foo: "bar" })).toBe(false);
        expect(isColor(null)).toBe(false);
        expect(isColor({ r: 0, g: 0, b: "0" })).toBe(false);
    });
});
