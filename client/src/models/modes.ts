interface Modes {
    [name: string]: Mode;
}

interface Mode {
    on: boolean;
    kwargs: {
        [key: string]: "str" | "float" | "int";
    };
}
