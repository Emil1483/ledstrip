import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { Grid, Button, Modal, DialogTitle, alpha, AppBar, Toolbar, Box } from '@mui/material';
import { useLongPress } from "@uidotdev/usehooks";

import Stack from '@mui/joy/Stack';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';


import { getModes as fetchModes, setMode } from "@/services/modes";
import ModalDialog from "@mui/joy/ModalDialog";
import React from "react";
import KwargsForm from "@/components/kwargsForm";
import { isColor, isRangedFloat } from "@/models/typeCheckers";
import assert from "assert";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { fetchSavedStates } from "@/services/users";


interface PageProps {
    initialModes: Modes;
    savedStates: SavedStates;
}


const Home: React.FC<PageProps> = ({ initialModes, savedStates }) => {
    const [modes, setModes] = useState(initialModes);

    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [kwargsFormData, setKwargsFormData] = useState<ModeState>({});

    function canAutoChange() {
        if (selectedMode === null) return false

        const autoChangeable = ["color", "ranged_float"]

        return Object.values(modes[selectedMode].kwargs).every(v => autoChangeable.includes(v.type))
    }

    async function changeMode(mode: string) {
        try {
            await setMode({ mode: mode, kwargs: kwargsFormData })
            const newModes = await fetchModes()
            setModes(newModes)
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (selectedMode && canAutoChange()) {
            changeMode(selectedMode)
        }
    }, [kwargsFormData])

    function getButtonElement(element: HTMLElement): HTMLElement {
        if (element.tagName === 'BUTTON') {
            return element
        }
        assert(element.parentElement, `Could not find button element`)
        return getButtonElement(element.parentElement)
    }

    function selectMode(mode: string) {
        assert(mode in modes, `Mode ${mode} not found`)
        setKwargsFormData({})
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
        if (modes[mode].on) return

        if (Object.values(modes[mode].kwargs).map(v => v.default).some(v => v === undefined)) {
            selectMode(mode);
            return
        }

        try {
            await setMode({ mode: mode, kwargs: {} })
            const newModes = await fetchModes()
            setModes(newModes)
        } catch (error) {
            console.error(error);
        }
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

    return <>
        <AppBar sx={{ backgroundColor: "#1835F2" }}>
            < Toolbar >
                <Box sx={{ flexGrow: 1 }}></Box>
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </ Toolbar>
        </AppBar >
        <Grid
            container
            sx={{
                backgroundColor: '#242635',
                color: 'white',
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingBottom: '42px',
                height: '100vh',
                alignItems: 'flex-end',
            }}>
            <Grid container spacing={4} sx={{ padding: '20px', justifyContent: 'flex-end' }}>
                {Object.entries(modes).map(([key, value]) => (
                    <Grid item xs={6} sm={6} md={4} key={key}>
                        <Button
                            {...longPressAttrs}
                            variant="contained"
                            id={key}
                            onClick={() => onModeClicked(key)}
                            sx={{
                                width: '100%',
                                height: '128px',
                                backgroundColor: value.on ? '#1835F2' : '#3E4051',
                                borderRadius: '8px',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography level="h4" textColor="common.white" fontWeight="bold">
                                {key.toUpperCase()}
                            </Typography>

                            <Grid sx={{
                                flexDirection: 'column',
                            }}>
                                {Array.from(generateStateComponents(value.state))}
                            </Grid>
                        </Button>
                    </Grid>
                ))}
            </Grid>


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
                        <ModalClose onClick={() => setSelectedMode(null)} />
                        <DialogTitle>{selectedMode.toUpperCase()}</DialogTitle>

                        <form
                            onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
                                event.preventDefault();
                                await changeMode(selectedMode)
                            }}
                        >
                            <Stack spacing={2} sx={{
                                paddingRight: '16px',
                                paddingLeft: '16px',
                                paddingBottom: '16px',
                            }}>
                                <KwargsForm
                                    kwargs={modes[selectedMode].kwargs}
                                    currentState={modes[selectedMode].state}
                                    onDataChanged={setKwargsFormData}
                                    mode={selectedMode}
                                    initialSavedStates={savedStates[selectedMode] || []}
                                ></KwargsForm>
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
                            </Stack>
                        </form>
                    </ModalDialog>
                    : <></>}
            </Modal >
        </Grid>
    </>

};

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
    const { userId } = getAuth(context.req);

    if (!userId) {
        return {
            redirect: {
                destination: "/sign-in",
                permanent: false,
            },
        };
    }

    return {
        props: {
            initialModes: await fetchModes(),
            savedStates: await fetchSavedStates(userId),
        }
    };
};

export default Home;
