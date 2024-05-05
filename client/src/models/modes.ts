interface Modes {
    [mode: string]: Mode;
}

interface SavedStates {
    [mode: string]: ModeState[];
}

interface Mode {
    on: boolean;
    kwargs: ModeKwargs;
    state: ModeState;
}

type ModeKwarg =
    | {
          type: "color";
          default?: Color;
      }
    | {
          type: "float" | "int";
          default?: number;
      }
    | {
          type: "str";
          default?: string;
      }
    | {
          type: "ranged_float";
          default?: RangedFloat;
          metadata: {
              min: number;
              max: number;
          };
      };

interface ModeKwargs {
    [key: string]: ModeKwarg;
}

interface ModeState {
    [key: string]: string | number | Color | RangedFloat;
}

type Color = { r: number; g: number; b: number };

type RangedFloat = { value: number };
