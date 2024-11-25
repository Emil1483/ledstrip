'use client'

import { Grid, Button, alpha, Box, Typography, List, ListItemButton, ListItemText, Icon, IconButton } from '@mui/material';
import KwargsFormDialog from "@/components/KwargsFormDialog";
import assert from "assert";
import Stack from '@mui/joy/Stack';
import { isColor, isRangedFloat } from "@/models/typeCheckers";
import { useLongPress } from "@uidotdev/usehooks";
import { useState } from 'react';
import { useCurrentModes, useChangeMode, useSavedKwargs, useDeleteSavedKwargs } from '@/contexts/ModesContext';
import { icons } from '@/models/icons';
import useConfirm from '@/hooks/useConfirm';



const ModesComponent: React.FC = () => {
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const currentModes = useCurrentModes()
    const changeMode = useChangeMode()
    const savedKwargs = useSavedKwargs()
    const deleteSavedKwargs = useDeleteSavedKwargs()
    const [ConfirmDialog, confirm] = useConfirm()

    function getButtonElement(element: HTMLElement): HTMLElement {
        if (element.tagName === 'BUTTON') {
            return element
        }
        assert(element.parentElement, `Could not find button element`)
        return getButtonElement(element.parentElement)
    }

    function getElementByClass(element: HTMLElement, className: string): HTMLElement {
        if (element.classList.contains(className)) {
            return element
        }
        assert(element.parentElement, `Could not find element with class ${className}`)
        return getElementByClass(element.parentElement, className)
    }

    function selectMode(mode: string) {
        assert(mode in currentModes, `Mode ${mode} not found`)
        setSelectedMode(mode)
    }

    const longPressAttrs = useLongPress(
        (e) => {
            const buttonElement = getButtonElement(e.target as HTMLElement);
            const mode = buttonElement.id
            selectMode(mode);
        },
        { threshold: 500 }
    );

    const savedKwargsLongPressAttrs = useLongPress(
        async (e) => {
            const buttonElement = getElementByClass(e.target as HTMLElement, "saved-kwargs-button");
            const id = parseInt(buttonElement.id)
            const kwargs = savedKwargs.find(kwargs => kwargs.id === id)
            if (!kwargs) {
                throw new Error(`Could not find saved kwargs with id ${id}`)
            }
            const confirmed = await confirm(`Do you want to delete ${kwargs.name}`)
            if (confirmed) {
                await deleteSavedKwargs(id)
            }
        },
        { threshold: 500 }
    );


    const onModeClicked = async (mode: string) => {
        if (currentModes[mode].on) return

        if (Object.values(currentModes[mode].kwargs).map(v => v.default).some(v => v === undefined)) {
            selectMode(mode);
            return
        }

        changeMode(mode, {})
    };

    function* generateStateComponents(state: ModeState) {
        for (const [key, value] of Object.entries(state)) {
            if (isColor(value)) {
                yield <Stack key={key}
                    sx={{
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant='body2' textTransform="capitalize">{key}:</Typography>
                    <div style={{
                        width: 20,
                        height: 20,
                        backgroundColor: `rgb(${value.r},${value.g},${value.b})`,
                        borderColor: alpha('#000', 0.75),
                        borderWidth: 1,
                        borderStyle: 'solid',
                        marginLeft: '6px',
                    }}></div>
                </Stack>
                continue
            }

            if (isRangedFloat(value)) {
                yield <Typography variant='body2' textTransform="capitalize" key={key}>{key}: {value.value}</Typography>
                continue
            }

            yield <Typography variant='body2' textTransform="capitalize" key={key}>{key}: {value}</Typography>
        }
    }

    return <>
        <Box sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
        }}>
            <List sx={{ padding: "0px", flexGrow: 1 }} >
                {savedKwargs.map((kwargs) => {
                    const Icon = icons.find(icon => icon.id === kwargs.iconId)?.Icon
                    if (!Icon) {
                        throw new Error(`Icon with id ${kwargs.iconId} not found`)
                    }

                    let color = undefined
                    for (const value of Object.values(kwargs.kwargs)) {
                        if (isColor(value)) {
                            color = `rgb(${value.r},${value.g},${value.b})`
                            break
                        }
                    }

                    return <ListItemButton
                        {...savedKwargsLongPressAttrs}
                        key={kwargs.id}
                        id={kwargs.id.toString()}
                        className='saved-kwargs-button'
                        onClick={() => changeMode(kwargs.mode, kwargs.kwargs)}>
                        <ListItemText primary={kwargs.name} />
                        <Icon sx={{ color: color }} />
                    </ListItemButton>;
                })}
            </List>
            <Box sx={{
                display: "flex",
                alignItems: "end",
                padding: "0px 12px 20px 12px",
            }}>
                <Grid container spacing={2}>
                    {Object.entries(currentModes).map(([key, mode]) => (
                        <Grid item xs={6} key={key}>
                            <Button
                                {...longPressAttrs}
                                variant="contained"
                                id={key}
                                className="mode-button"
                                onClick={() => onModeClicked(key)}
                                color={mode.on ? 'primary' : 'inherit'}
                                sx={{
                                    width: '100%',
                                    height: '128px',
                                    borderRadius: '8px',
                                    flexDirection: 'column'
                                }}
                            >

                                <Typography variant='h4' fontWeight="bold">
                                    {key.toUpperCase()}
                                </Typography>


                                <Grid sx={{ flexDirection: 'column' }}>
                                    {Array.from(generateStateComponents(mode.state))}
                                </Grid>
                            </Button>
                        </Grid>)
                    )}
                </Grid>
            </Box>
        </Box>

        {selectedMode &&
            <KwargsFormDialog
                mode={selectedMode}
                onClose={() => setSelectedMode(null)}
            ></KwargsFormDialog>
        }

        <ConfirmDialog />
    </>
}

export default ModesComponent