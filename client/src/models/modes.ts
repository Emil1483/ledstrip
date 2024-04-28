interface Modes {
    [name: string]: Mode;
}

interface Mode {
    on: boolean;
    kwargs: ModeKwargs;
    state: ModeState;
}

interface ModeKwargs {
    [key: string]: {
        type: "str" | "float" | "int" | "color";
        default?: string | number | Color;
    };
}

interface ModeState {
    [key: string]: string | number | Color;
}

interface Color {
    r: number;
    g: number;
    b: number;
}
