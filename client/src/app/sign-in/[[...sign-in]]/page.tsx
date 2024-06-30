'use client'

import { SignIn } from "@clerk/nextjs";
import { Grid } from "@mui/material";

export default function Page() {
    return <Grid container sx={{
        alignContent: 'center',
        height: '100vh',
        justifyContent: 'center',
    }}>
        <SignIn path="/sign-in" />
    </Grid>
}