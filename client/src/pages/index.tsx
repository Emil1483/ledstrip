import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { Grid, Button, Modal, DialogTitle, alpha, AppBar, Toolbar, Box } from '@mui/material';
import { useLongPress } from "@uidotdev/usehooks";

import Stack from '@mui/joy/Stack';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';


import { fetchModes as fetchModes, setMode } from "@/services/modes";
import ModalDialog from "@mui/joy/ModalDialog";
import React from "react";
import KwargsForm from "@/components/kwargsForm";
import { isColor, isRangedFloat } from "@/models/typeCheckers";
import assert from "assert";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { fetchSavedStates } from "@/services/users";
import { useSavedStatesStore } from "@/hooks/useSavedStatesStore";
import { useShallow } from "zustand/react/shallow";
import { useCurrentModes } from "@/hooks/useCurrentModes";
import mqtt, { MqttClient } from "mqtt";


interface PageProps {
    initialModes: Modes;
    initialSavedStates: SavedStates;
}


const Home: React.FC<PageProps> = ({ initialModes, initialSavedStates }) => {
    const [selectedMode, setSelectedMode] = useState<string | null>(null);

    const setSavedStates = useSavedStatesStore((state) => state.setSavedStates);
    const [modes, setModes] = useCurrentModes(
        useShallow((state) => [state.currentModes, state.setCurrentModes])
    )

    useEffect(() => {
        setSavedStates(initialSavedStates);
        setModes(initialModes);
    }, [setSavedStates, setModes, initialModes, initialSavedStates]);

    const [mqttClient, setMqttClient] = useState<MqttClient | null>(null);

    useEffect(() => {
        const client = mqtt.connect(`ws://${process.env.NEXT_PUBLIC_MQTT_HOST}:9001`);

        const topic = "lights/status";

        client.on("connect", () => {
            console.log("Connected to broker");
            client.subscribe(topic, (err) => {
                if (err) {
                    console.error(
                        `Failed to subscribe to topic ${topic}: ${err.message}`
                    );
                }
            });
        });

        client.on('error', (error) => {
            console.error('Connection error: ', error);
        });

        client.on("message", (topic, message) => {
            const jsonMessage: Modes = JSON.parse(message.toString());
            setModes(jsonMessage);
        });

        setMqttClient(client);
    }, []);

    function getButtonElement(element: HTMLElement): HTMLElement {
        if (element.tagName === 'BUTTON') {
            return element
        }
        assert(element.parentElement, `Could not find button element`)
        return getButtonElement(element.parentElement)
    }

    function selectMode(mode: string) {
        assert(mode in modes, `Mode ${mode} not found`)
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
            mqttClient!.publish("lights/rpc/request/set_mode/a", JSON.stringify({ mode: mode, kwargs: {} }))
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
                {Object.entries(modes).map(([key, mode]) => (
                    <Grid item xs={6} sm={6} md={4} key={key}>
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

                            <Grid sx={{
                                flexDirection: 'column',
                            }}>
                                {Array.from(generateStateComponents(mode.state))}
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
                        <ModalClose id="modal-close" onClick={() => setSelectedMode(null)} />
                        <DialogTitle>{selectedMode.toUpperCase()}</DialogTitle>

                        <Stack spacing={2} sx={{
                            paddingRight: '16px',
                            paddingLeft: '16px',
                            paddingBottom: '16px',
                        }}>
                            <KwargsForm
                                mode={selectedMode}
                                mqttClient={mqttClient!}
                            ></KwargsForm>

                        </Stack>
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
            initialSavedStates: await fetchSavedStates(userId),
        }
    };
};

export default Home;
