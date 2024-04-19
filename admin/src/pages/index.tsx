import { PortainerEnvironment } from "@/models/portainerModels";
import { fetchEnvironments, getPortainerJwtTokenFromCookie } from "@/services/portainer";
import { GetServerSideProps } from "next";
import React from "react";

import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { Global } from "@emotion/react";



interface PageProps {
    environments: PortainerEnvironment[];
}

const Home: React.FC<PageProps> = ({ environments }) => {
    return (
        <>
            <Global styles={"body {margin: 0;}"} />
            <div>
                <h2>Environments</h2>
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {environments.map((environment) => (
                        <ListItemButton component="a" href={`/environments/${environment.Id}`} key={environment.Id}>
                            <ListItemText primary={environment.Name} secondary={environment.Id} />
                        </ListItemButton>
                    ))}
                </List>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
    const token = getPortainerJwtTokenFromCookie(context);
    return {
        props: {
            environments: await fetchEnvironments(token)
        }
    };
};


export default Home;
