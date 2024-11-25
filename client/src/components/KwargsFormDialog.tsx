'use client'

import { useEffect, useState } from "react";
import React from "react";

import FloatInput from "@/components/floatInput";
import IntInput from "@/components/intInput";
import StrInput from "@/components/strInput";
import ColorInput from "@/components/colorInput";
import { isColor, isRangedFloat } from "@/models/typeCheckers";
import RangedFloatInput from "@/components/rangedFloat";
import { Box, Button, Grid, IconButton, FormControl, FormLabel, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { Close, Save } from "@mui/icons-material";
import assert from "assert";
import { useChangeMode, useChangeModeFast, useCurrentModes } from "@/contexts/ModesContext";
import SaveDialog from "@/components/SaveDialog";

interface KwargsFormProps {
    mode: string
    onClose: () => void
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


const KwargsFormDialog: React.FC<KwargsFormProps> = ({ mode, onClose }) => {
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
        for (const [key, value] of Object.entries(currentModes[mode!].kwargs)) {
            switch (value.type) {
                case 'str':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <StrInput value={asString(state[key])} onChange={(value) => { handleStateChange(key, value) }} />
                    </FormControl>
                    break
                case 'int':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <IntInput value={asNumber(state[key])} onChange={(value) => { handleStateChange(key, value) }} />
                    </FormControl>
                    break
                case 'float':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <FloatInput value={asNumber(state[key])} onChange={(value) => { handleStateChange(key, value) }} />
                    </FormControl>
                    break

                case 'color':
                    yield <FormControl key={key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <FormLabel
                            sx={{ fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <ColorInput value={asColor(state[key])} onChange={(value) => { handleStateChange(key, value) }} />
                    </FormControl>
                    break

                case 'ranged_float':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ fontWeight: 'bold' }}>
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
        return Object.values(currentModes[mode!].kwargs).every(v => autoChangeable.includes(v.type))
    }



    return <Dialog
        open={true}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
            component: 'form',
            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault()
                changeMode(mode, state)
            }
        }}>
        <DialogTitle>{mode.toUpperCase()}</DialogTitle>
        <IconButton
            aria-label="close"
            id="modal-close"
            onClick={onClose}
            sx={(theme) => ({
                position: 'absolute',
                right: 8,
                top: 8,
                color: theme.palette.grey[500],
            })}
        >
            <Close />
        </IconButton>
        <DialogContent>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
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
                            borderRadius: '8px',
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
                        <Save fontSize="inherit" />
                    </IconButton>
                </Box>
            </Grid>
        </DialogContent>

        <SaveDialog
            open={saving}
            onClose={() => setSaving(false)}
        />
    </Dialog >

};

export default KwargsFormDialog