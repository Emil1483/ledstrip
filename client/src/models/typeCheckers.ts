export function isColor(value: any): value is Color {
    if (value === null || typeof value !== "object") return false;
    if (Array.isArray(value)) return false;
    if (Object.keys(value).length !== 3) return false;
    return (
        typeof value.r === "number" &&
        typeof value.g === "number" &&
        typeof value.b === "number"
    );
}

export function isRangedFloat(value: any): value is RangedFloat {
    if (value === null || typeof value !== "object") return false;
    if (Array.isArray(value)) return false;
    if (Object.keys(value).length !== 1) return false;
    return typeof value.value === "number";
}
