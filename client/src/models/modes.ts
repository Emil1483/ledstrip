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

type Kwarg = "str" | "float" | "int";

interface UpdateKwargsProps {
    [key: string]: string | number;
}
