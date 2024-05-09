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
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useLongPress } from "@uidotdev/usehooks";
import assert from "assert";
import useConfirm from "@/hooks/useConfirm";

interface KwargsFormProps {
    kwargs: ModeKwargs
    currentState: ModeState
    onDataChanged: (data: ModeState) => void
    mode: string
    initialSavedStates: ModeState[]
}


const KwargsForm: React.FC<KwargsFormProps> = ({ kwargs, onDataChanged: onStateChanged, currentState, mode, initialSavedStates }) => {
    const defaultState: ModeState = {}
    for (const [key, value] of Object.entries(kwargs)) {
        if (key in currentState) {
            defaultState[key] = currentState[key]
        } else if (value.default !== undefined) {
            defaultState[key] = value.default
        }
    }

    const [state, setState] = useState<ModeState>(defaultState)
    const [savedStates, setSavedStates] = useState<ModeState[]>(initialSavedStates)
    const [Dialog, confirmDelete] = useConfirm()

    useEffect(() => {
        onStateChanged(state)
    }, [state])


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
            setSavedStates(savedStates[mode])
        } else {
            console.error('Failed to save state')
        }
    }


    function handleChange(key: string, value: any) {
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
        for (const [key, value] of Object.entries(kwargs)) {
            switch (value.type) {
                case 'str':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ color: 'white', fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <StrInput value={asString(state[key])} onChange={(value) => { handleChange(key, value) }} />
                    </FormControl>
                    break
                case 'int':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ color: 'white', fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <IntInput value={asNumber(state[key])} onChange={(value) => { handleChange(key, value) }} />
                    </FormControl>
                    break
                case 'float':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ color: 'white', fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <FloatInput value={asNumber(state[key])} onChange={(value) => { handleChange(key, value) }} />
                    </FormControl>
                    break

                case 'color':
                    yield <FormControl key={key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <FormLabel
                            sx={{ color: 'white', fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <ColorInput value={asColor(state[key])} onChange={(value) => { handleChange(key, value) }} />
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
                            onChange={(value) => { handleChange(key, value) }}
                            min={value.metadata.min}
                            max={value.metadata.max} />
                    </FormControl>
                    break
                default:
                    throw new Error(`Unknown input type: ${value}`)
            }
        }
    }

    async function handleDeleteState(index: number) {
        assert(index >= 0 && index < savedStates.length)

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
            console.log(savedStates)
            setSavedStates(savedStates[mode])
        } else {
            console.error('Failed to delete state')
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

    return <>
        {Array.from(generateInputs())}
        <Grid
            container
            sx={{
                flexDirection: 'row',
                justifyContent: 'center',
            }}>
            {savedStates.map((state, i) => <Button
                {...longPressAttrs}
                onClick={() => setState(state)}
                variant="outlined"
                color="primary"
                key={i}
                id={i.toString()}
                sx={{
                    marginRight: '8px',
                    marginLeft: '8px',
                    marginBottom: '8px',
                }}>
                <BookmarkIcon />
            </Button>
            )}
            <Button onClick={handleSaveState} variant="contained" color="primary" sx={{
                marginRight: '8px',
                marginLeft: '8px',
                marginBottom: '8px',
            }}>
                <BookmarkAddIcon />
            </Button>
        </Grid>
        <Dialog />
    </>
};

export default KwargsForm