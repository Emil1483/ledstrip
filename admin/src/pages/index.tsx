import { PortainerEnvironment } from "@/models/portainerModels";
import { fetchEnvironments, getPortainerJwtTokenFromCookie } from "@/services/portainer";
import { GetServerSideProps } from "next";
import React from "react";

import { Divider, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { Global } from "@emotion/react";
import Head from "next/head";



interface PageProps {
    environments: PortainerEnvironment[];
}

const Home: React.FC<PageProps> = ({ environments }) => {
    return (
        <>
            <Head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Global styles={"body {margin: 0;}"} />

            <div style={{ textAlign: 'center', padding: '20px' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Environments
                </Typography>
            </div>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {environments.map((environment, index) => (
                    <React.Fragment key={environment.Id}>
                        <ListItemButton component="a" href={`/environments/${environment.Id}`}>
                            <ListItemText primary={environment.Name} secondary={environment.Id} />
                        </ListItemButton>
                        {index < environments.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>

        </>
    );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
    const token = getPortainerJwtTokenFromCookie(context.req);
    return {
        props: {
            environments: await fetchEnvironments(token)
        }
    };
};


export default Home;
