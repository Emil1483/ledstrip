import { GetServerSideProps } from "next";
import Head from 'next/head';
import { Box, Grid, Button, createTheme, Typography, ThemeProvider } from '@mui/material';

import { getModes, setMode } from "@/services/modes";
import { useState } from "react";
import { Global } from "@emotion/react";


interface PageProps {
    initialModes: Modes;
}

const Home: React.FC<PageProps> = ({ initialModes }) => {
    const [modes, setModes] = useState(initialModes);


    const handleSubmit = async (mode: string) => {
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
                backgroundColor: '#121212',
                color: 'white',
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingBottom: '42px',
                height: '100vh',
                alignItems: 'flex-end',
            }}
        >
            <Grid container spacing={2} sx={{ padding: '20px', justifyContent: 'flex-end' }}>
                {Object.entries(modes).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                        <Button
                            variant="contained"
                            disabled={value.on}
                            onClick={() => handleSubmit(key)}
                            sx={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#3700B3',
                            }}
                        >
                            <Typography variant="h6" color="white">
                                {key.toUpperCase()}
                            </Typography>
                        </Button>
                    </Grid>
                ))}
            </Grid>
        </Grid>
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
