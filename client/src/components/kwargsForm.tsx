import { FormControl, FormLabel, Stack } from "@mui/joy";
import FloatInput from "@/components/floatInput";
import IntInput from "@/components/intInput";
import StrInput from "@/components/strInput";
import { useEffect, useState } from "react";
import React from "react";

interface KwargsFormProps {
    kwargs: ModeKwargs
    onDataChanged: (data: UpdateKwargsProps) => void
}


const KwargsForm: React.FC<KwargsFormProps> = ({ kwargs, onDataChanged }) => {
    const [data, setData] = useState<UpdateKwargsProps>({})

    useEffect(() => {
        onDataChanged(data)
    }, [data])


    function handleChange(key: string, value: any) {
        if (value === null) {
            if (key in data) {
                setData((data) => {
                    let d = { ...data }
                    delete d[key]
                    return d
                })
            }
            return
        }

        setData((data) => {
            return { ...data, [key]: value }
        })
    }

    function* generateInputs(kwargs: ModeKwargs) {
        for (const [key, value] of Object.entries(kwargs)) {
            switch (value) {
                case 'str':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ color: 'white', fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <StrInput onChange={(value) => { handleChange(key, value) }} />
                    </FormControl>
                    break
                case 'int':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ color: 'white', fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <IntInput onChange={(value) => { handleChange(key, value) }} />
                    </FormControl>
                    break
                case 'float':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ color: 'white', fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <FloatInput onChange={(value) => { handleChange(key, value) }} />
                    </FormControl>
                    break
                default:
                    throw new Error(`Unknown input type: ${value}`)
            }
        }
    }

    return <>
        {Array.from(generateInputs(kwargs))}
    </>
};

export default KwargsForm