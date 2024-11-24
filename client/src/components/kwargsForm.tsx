'use client'

import { useEffect, useState } from "react";
import React from "react";

import FloatInput from "@/components/floatInput";
import IntInput from "@/components/intInput";
import StrInput from "@/components/strInput";
import ColorInput from "@/components/colorInput";
import { isColor, isRangedFloat } from "@/models/typeCheckers";
import RangedFloatInput from "@/components/rangedFloat";
import { Box, Button, Grid, IconButton, FormControl, FormLabel } from "@mui/material";
import { Save } from "@mui/icons-material";
import assert from "assert";
import { useChangeMode, useChangeModeFast, useCurrentModes } from "@/contexts/ModesContext";
import SaveDialog from "@/components/SaveDialog";

interface KwargsFormProps {
    mode: string
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


const KwargsForm: React.FC<KwargsFormProps> = ({ mode }) => {
    const [saving, setSaving] = useState(false)

    const currentModes = useCurrentModes()
    const changeMode = useChangeMode()
    const changeModeFast = useChangeModeFast()

    assert(mode in currentModes, `Mode ${mode} not found`)

    const [state, setState] = useState<ModeState>(getDefaultState(currentModes[mode]))


    useEffect(() => {
        if (canAutoChange()) {
            changeModeFast(mode, state)
        }
    }, [state])


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
        for (const [key, value] of Object.entries(currentModes[mode].kwargs)) {
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

    function canAutoChange() {
        const autoChangeable = ["color", "ranged_float"]
        return Object.values(currentModes[mode].kwargs).every(v => autoChangeable.includes(v.type))
    }

    return <>
        <form onSubmit={(event) => {
            event.preventDefault()
            changeMode(mode, state)
        }}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                backgroundColor: '#242635',
                width: '100%',
            }}>
                {Array.from(generateInputs())}
            </Box>
            <Grid
                container
                sx={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}>

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

                <Box sx={{
                    width: '100%',
                    justifyContent: 'right',
                    display: 'flex',
                }}>
                    <IconButton
                        aria-label="save"
                        size="large"
                        sx={{ marginTop: "24px" }}
                        onClick={() => setSaving(true)}>
                        <Save fontSize="inherit" sx={{ color: "white" }} />
                    </IconButton>
                </Box>
            </Grid>
        </form>
        <SaveDialog
            open={saving}
            onClose={() => setSaving(false)}
        />
    </>

};

export default KwargsForm