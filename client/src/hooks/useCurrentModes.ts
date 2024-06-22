import { create } from "zustand";

interface State {
    currentModes: Modes;
    setCurrentModes: (newCurrentModes: Modes) => void;
}

export const useCurrentModes = create<State>((set) => ({
    currentModes: {},
    setCurrentModes: (newCurrentModes) => {
        set((_) => ({ currentModes: newCurrentModes }));
    },
}));
