import { useEffect, useState } from "react";
import React from "react";

import { FormControl, FormLabel } from "@mui/joy";

import FloatInput from "@/components/floatInput";
import IntInput from "@/components/intInput";
import StrInput from "@/components/strInput";
import ColorInput from "@/components/colorInput";
import { isColor, isRangedFloat } from "@/models/typeCheckers";
import RangedFloatInput from "@/components/rangedFloat";
import { Button, Grid } from "@mui/material";
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import { useLongPress } from "@uidotdev/usehooks";
import assert from "assert";
import useConfirm from "@/hooks/useConfirm";
import { useSavedStatesStore } from "@/hooks/useSavedStatesStore";
import { useShallow } from "zustand/react/shallow";
import { SavedStateComponent } from "@/components/SavedStateComponent";
import { useCurrentModes } from "@/hooks/useCurrentModes";
import { fetchModes, setMode } from "@/services/modes";
import { MqttClient } from "mqtt";

interface KwargsFormProps {
    mode: string
    mqttClient: MqttClient
}

function getDefaultState(mode: Mode) {
    const defaultState: ModeState = {}
    for (const [key, value] of Object.entries(mode.kwargs)) {
        if (key in mode.state) {
            defaultState[key] = mode.state[key]
        } else if (value.default !== undefined) {
            defaultState[key] = value.default
        }
    }
    return defaultState
}


const KwargsForm: React.FC<KwargsFormProps> = ({ mode, mqttClient }) => {
    const [modes, setModes] = useCurrentModes(
        useShallow((state) => [state.currentModes, state.setCurrentModes])
    )

    assert(mode in modes, `Mode ${mode} not found`)

    const [state, setState] = useState<ModeState>(getDefaultState(modes[mode]))
    const [Dialog, confirmDelete] = useConfirm()

    const { savedStates, setSavedStates } = useSavedStatesStore(
        useShallow((state) => ({ savedStates: state.savedStates, setSavedStates: state.setSavedStates })
        ))

    async function updateMode() {
        try {
            mqttClient!.publish("lights/rpc/request/set_mode/a", JSON.stringify({ mode: mode, kwargs: state }))
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (canAutoChange()) {
            updateMode()
        }
    }, [state])

    function currentStateIsSaved(): boolean {
        for (const savedState of currentSavedStates()) {
            if (JSON.stringify(savedState) === JSON.stringify(state)) {
                return true
            }
        }
        return false
    }


    async function handleSaveState() {
        const result = await fetch(`/api/saveState`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mode: mode,
                state: state
            }),
        })

        const savedStates = await result.json()

        if (result.ok) {
            setSavedStates(savedStates)
        } else {
            console.error('Failed to save state')
        }
    }

    async function handleDeleteState(index: number) {
        assert(index >= 0 && index < currentSavedStates().length)

        const result = await fetch(`/api/deleteState`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mode: mode,
                index: index
            }),
        })

        if (result.ok) {
            const savedStates = await result.json()
            setSavedStates(savedStates)
        } else {
            console.error('Failed to delete state')
        }
    }

    function handleStateChange(key: string, value: any) {
        if (value === null) {
            if (key in state) {
                setState((data) => {
                    let d = { ...data }
                    delete d[key]
                    return d
                })
            }
        } else {
            setState((data) => {
                return { ...data, [key]: value }
            })
        }
    }

    function asString(value: any): string | undefined {
        return typeof value === 'string' ? value : undefined
    }

    function asNumber(value: any): number | undefined {
        return typeof value === 'number' ? value : undefined
    }

    function asColor(value: any): Color | undefined {
        return isColor(value) ? value : undefined
    }

    function asRangedFloat(value: any): RangedFloat | undefined {
        return isRangedFloat(value) ? value : undefined
    }

    function* generateInputs() {
        for (const [key, value] of Object.entries(modes[mode].kwargs)) {
            switch (value.type) {
                case 'str':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ color: 'white', fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <StrInput value={asString(state[key])} onChange={(value) => { handleStateChange(key, value) }} />
                    </FormControl>
                    break
                case 'int':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ color: 'white', fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <IntInput value={asNumber(state[key])} onChange={(value) => { handleStateChange(key, value) }} />
                    </FormControl>
                    break
                case 'float':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ color: 'white', fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <FloatInput value={asNumber(state[key])} onChange={(value) => { handleStateChange(key, value) }} />
                    </FormControl>
                    break

                case 'color':
                    yield <FormControl key={key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <FormLabel
                            sx={{ color: 'white', fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <ColorInput value={asColor(state[key])} onChange={(value) => { handleStateChange(key, value) }} />
                    </FormControl>
                    break

                case 'ranged_float':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ color: 'white', fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <RangedFloatInput
                            value={asRangedFloat(state[key])}
                            onChange={(value) => { handleStateChange(key, value) }}
                            min={value.metadata.min}
                            max={value.metadata.max} />
                    </FormControl>
                    break
                default:
                    throw new Error(`Unknown input type: ${value}`)
            }
        }
    }

    function getButtonElement(element: HTMLElement): HTMLElement {
        if (element.tagName === 'BUTTON') {
            return element
        }
        assert(element.parentElement, `Could not find button element`)
        return getButtonElement(element.parentElement)
    }

    const longPressAttrs = useLongPress(
        async (e) => {
            const buttonElement = getButtonElement(e.target as HTMLElement);
            const index = parseInt(buttonElement.id)
            const confirmed = await confirmDelete(`Are you sure you want to delete saved state nr ${index}`)
            if (!confirmed) return
            await handleDeleteState(index)
        },
        { threshold: 500 }
    )

    function currentSavedStates(): ModeState[] {
        return savedStates[mode] ?? []
    }

    function canAutoChange() {
        // const autoChangeable = ["color", "ranged_float"]
        const autoChangeable: string[] = []
        return Object.values(modes[mode].kwargs).every(v => autoChangeable.includes(v.type))
    }

    return <form onSubmit={(event) => {
        event.preventDefault()
        updateMode()
    }}>
        {Array.from(generateInputs())}
        <Grid
            container
            sx={{
                flexDirection: 'row',
                justifyContent: 'center',
            }}>
            {currentSavedStates().map((state, i) => <SavedStateComponent
                id={i.toString()}
                index={i}
                state={state}
                key={i}
                onClick={() => setState(state)}
                longPressFns={longPressAttrs}
            />)}
            {!currentStateIsSaved()
                && <Button onClick={handleSaveState} variant="outlined" color="primary" sx={{
                    marginRight: '8px',
                    marginLeft: '8px',
                    marginBottom: '8px',
                }}>
                    <BookmarkAddIcon />
                </Button>}

            {!canAutoChange() &&
                <Button
                    type="submit"
                    sx={{
                        width: '100%',
                        backgroundColor: '#1835F2',
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: 'bold',
                    }}
                >Submit</Button>
            }

        </Grid>
        <Dialog />
    </form>
};

export default KwargsForm