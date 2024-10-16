"use client";

import { create } from "zustand";

interface State {
    savedStates: SavedStates;
    setSavedStates: (newSavedStates: SavedStates) => void;
}

export const useSavedStatesStore = create<State>((set) => ({
    savedStates: {},
    setSavedStates: (newSavedStates) => {
        set((_) => ({ savedStates: newSavedStates }));
    },
}));
