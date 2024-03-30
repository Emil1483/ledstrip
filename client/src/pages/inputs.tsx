import { Button, Grid } from "@mui/joy";
import { Global } from "@emotion/react";
import KwargsForm from "@/components/kwargsForm";
import { useState } from "react";



const Inputs: React.FC = () => {
    const [kwargsFormData, setKwargsFormData] = useState<UpdateKwargsProps>({});

    return <>
        <Global styles={"body {margin: 0;}"} />

        <Grid
            container
            sx={{
                backgroundColor: '#242635',
                color: 'white',
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingTop: '42px',
                height: '100vh',
            }}
        >
            <KwargsForm
                onDataChanged={setKwargsFormData}
                kwargs={{
                    strInput: "str",
                    intInput: "int",
                    floatInput: "float",
                    colorInput: "color",
                }} />
            <Button
                onClick={() => { console.log(kwargsFormData) }}
                sx={{
                    width: '100%',
                    height: '50px',
                    backgroundColor: '#1835F2',
                    borderRadius: '8px',
                    borderColor: '#fff',
                    color: 'white',
                    fontWeight: 'bold',
                }}
            >Submit</Button>
        </Grid>
    </>
};

export default Inputs