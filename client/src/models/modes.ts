interface Modes {
    [name: string]: Mode;
}

interface Mode {
    on: boolean;
    kwargs: ModeKwargs;
}

interface ModeKwargs {
    [key: string]: Kwarg;
}

type Kwarg = "str" | "float" | "int" | "color";

interface UpdateKwargsProps {
    [key: string]: string | number;
}

interface Color {
    r: number;
    g: number;
    b: number;
}
