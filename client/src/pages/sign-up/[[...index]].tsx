import { SignUp } from "@clerk/nextjs";
import { Grid } from "@mui/material";

export default function Page() {
    return <Grid container sx={{
        alignContent: 'center',
        height: '100vh',
        justifyContent: 'center',
    }}>
        <SignUp path="/sign-up" />;
    </Grid>
}