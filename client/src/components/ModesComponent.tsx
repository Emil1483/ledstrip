'use client'

import { Grid, Button, Modal, DialogTitle, alpha, Box } from '@mui/material';
import ModalClose from '@mui/joy/ModalClose';
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from '@mui/joy/Typography';
import KwargsForm from "@/components/kwargsForm";
import assert from "assert";
import Stack from '@mui/joy/Stack';
import { isColor, isRangedFloat } from "@/models/typeCheckers";
import { useLongPress } from "@uidotdev/usehooks";
import { useEffect, useState } from 'react';
import { useCurrentModes, useChangeMode, useLightsMetaData } from '@/contexts/ModesContext';
import { AppBarComponent } from '@/components/AppBarComponent';
import { useSavedStatesStore } from '@/hooks/useSavedStatesStore';


interface ModesComponentProps {
    initialSavedStates: SavedStates;
}


const ModesComponent: React.FC<ModesComponentProps> = ({ initialSavedStates }) => {
    const setSavedStates = useSavedStatesStore((state) => state.setSavedStates);

    useEffect(() => {
        setSavedStates(initialSavedStates)
    }, [initialSavedStates, setSavedStates])

    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const currentModes = useCurrentModes()
    const changeMode = useChangeMode()

    function getButtonElement(element: HTMLElement): HTMLElement {
        if (element.tagName === 'BUTTON') {
            return element
        }
        assert(element.parentElement, `Could not find button element`)
        return getButtonElement(element.parentElement)
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
                    <Typography level="body-sm" textColor="common.white">{key}:</Typography>
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
                yield <Typography key={key} level="body-sm" textColor="common.white">{key}: {value.value}</Typography>
                continue
            }

            yield <Typography key={key} level="body-sm" textColor="common.white">{key}: {value}</Typography>
        }
    }

    return <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <AppBarComponent title={useLightsMetaData().id} />
        <Box sx={{
            flexGrow: 1,
            backgroundColor: '#242635',
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
                            sx={{
                                width: '100%',
                                height: '128px',
                                backgroundColor: mode.on ? '#1835F2' : '#3E4051',
                                borderRadius: '8px',
                                flexDirection: 'column'
                            }}
                        >

                            <Typography level="h4" textColor="common.white" fontWeight="bold">
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

        <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={selectedMode != null}
            onClose={() => setSelectedMode(null)}
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
            {selectedMode != null ?
                <ModalDialog
                    variant="plain"
                    sx={{
                        borderRadius: 'md',
                        p: 4,
                        boxShadow: 'lg',
                        width: '85%',
                        padding: '16px',
                        color: 'white',
                        backgroundColor: '#242635',
                    }}
                >
                    <ModalClose id="modal-close" onClick={() => setSelectedMode(null)} />
                    <DialogTitle>{selectedMode.toUpperCase()}</DialogTitle>

                    <Stack spacing={2} sx={{
                        paddingRight: '16px',
                        paddingLeft: '16px',
                        paddingBottom: '16px',
                    }}>
                        <KwargsForm
                            mode={selectedMode}
                        ></KwargsForm>

                    </Stack>
                </ModalDialog>
                : <></>}
        </Modal >
    </Box>
}

export default ModesComponent