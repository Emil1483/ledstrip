import { GetServerSideProps } from "next";
import Head from 'next/head';
import { useState } from "react";
import { Grid, Button, Modal, DialogTitle } from '@mui/material';
import { Global } from "@emotion/react";
import { useLongPress } from "@uidotdev/usehooks";

import Stack from '@mui/joy/Stack';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';


import { getModes, setMode } from "@/services/modes";
import ModalDialog from "@mui/joy/ModalDialog";
import React from "react";
import KwargsForm from "@/components/kwargsForm";


interface PageProps {
    initialModes: Modes;
}


const Home: React.FC<PageProps> = ({ initialModes }) => {
    const [modes, setModes] = useState(initialModes);

    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [kwargsFormData, setKwargsFormData] = useState<ModeState>({});

    const longPressAttrs = useLongPress(
        (e) => {
            const element = e.target as HTMLElement;
            const mode = element.id
            setSelectedMode(mode);
        },
        { threshold: 500 }
    );


    const handleSubmit = async (mode: string) => {
        if (modes[mode].on) return

        try {
            await setMode({ mode: mode, kwargs: {} })
            const newModes = await getModes()
            setModes(newModes)
        } catch (error) {
            console.error(error);
        }
    };

    return <>
        <Head>
            <link rel="manifest" href="/manifest.json" />
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <Global styles={"body {margin: 0;}"} />

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
            }}
        >
            <Grid container spacing={4} sx={{ padding: '20px', justifyContent: 'flex-end' }}>
                {Object.entries(modes).map(([key, value]) => (
                    <Grid item xs={6} sm={6} md={4} key={key}>
                        <Button
                            {...longPressAttrs}
                            variant="contained"
                            id={key}
                            onClick={() => handleSubmit(key)}
                            sx={{
                                width: '100%',
                                height: '128px',
                                backgroundColor: value.on ? '#1835F2' : '#3E4051',
                                borderRadius: '8px',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography level="h3" textColor="common.white" fontWeight="bold">
                                {key.toUpperCase()}
                            </Typography>

                            <Grid sx={{
                                flexDirection: 'column',
                            }}>
                                {Object.entries(value.state).map(([key, value]) => (
                                    <Typography key={key} level="body-sm" textColor="common.white">{key}: {typeof value === 'object' ? JSON.stringify(value) : value}</Typography>
                                ))}
                            </Grid>
                        </Button>
                    </Grid>
                ))}
            </Grid>
        </Grid>

        <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={selectedMode != null}
            onClose={() => setSelectedMode(null)}
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
            {selectedMode ?
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

                            try {
                                await setMode({ mode: selectedMode, kwargs: kwargsFormData })
                                const newModes = await getModes()
                                setModes(newModes)
                            } catch (error) {
                                console.error(error);
                            }

                        }}
                    >
                        <Stack spacing={2} sx={{
                            paddingRight: '16px',
                            paddingLeft: '16px',
                            paddingBottom: '16px',
                        }}>
                            <KwargsForm
                                kwargs={modes[selectedMode].kwargs}
                                onDataChanged={setKwargsFormData}
                            ></KwargsForm>
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
                        </Stack>
                    </form>

                </ModalDialog>

                : <></>}

        </Modal>
    </>;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
    return {
        props: {
            initialModes: await getModes()
        }
    };
};

export default Home;
