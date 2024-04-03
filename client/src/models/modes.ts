interface Modes {
    [name: string]: Mode;
}

interface Mode {
    on: boolean;
    kwargs: ModeKwargs;
    state: ModeState;
}

interface ModeKwargs {
    [key: string]: Kwarg;
}

type Kwarg = "str" | "float" | "int" | "color";

interface ModeState {
    [key: string]: string | number | Color;
}

interface Color {
    r: number;
    g: number;
    b: number;
}
