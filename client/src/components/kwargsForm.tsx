import { useEffect, useState } from "react";
import React from "react";

import { FormControl, FormLabel } from "@mui/joy";

import FloatInput from "@/components/floatInput";
import IntInput from "@/components/intInput";
import StrInput from "@/components/strInput";
import ColorInput from "@/components/colorInput";
import { isColor, isRangedFloat } from "@/models/typeCheckers";
import RangedFloatInput from "@/components/rangedFloat";

interface KwargsFormProps {
    kwargs: ModeKwargs
    currentState: ModeState
    onDataChanged: (data: ModeState) => void
}


const KwargsForm: React.FC<KwargsFormProps> = ({ kwargs, onDataChanged, currentState }) => {
    const defaultData: ModeState = {}
    for (const [key, value] of Object.entries(kwargs)) {
        if (key in currentState) {
            defaultData[key] = currentState[key]
        } else if (value.default !== undefined) {
            defaultData[key] = value.default
        }
    }

    const [data, setData] = useState<ModeState>(defaultData)

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
        } else {
            setData((data) => {
                return { ...data, [key]: value }
            })
        }
    }

    function asString(value: any): string | undefined {
        return typeof value === 'string' ? value : undefined
    }

    function asNumber(value: any): number | undefined {
        return typeof value === 'number' ? value : undefined
    }

    function asColor(value: any): Color | undefined {
        return isColor(value) ? value : undefined
    }

    function asRangedFloat(value: any): RangedFloat | undefined {
        return isRangedFloat(value) ? value : undefined
    }

    function* generateInputs(kwargs: ModeKwargs) {
        for (const [key, value] of Object.entries(kwargs)) {
            switch (value.type) {
                case 'str':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ color: 'white', fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <StrInput defaultValue={asString(defaultData[key])} onChange={(value) => { handleChange(key, value) }} />
                    </FormControl>
                    break
                case 'int':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ color: 'white', fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <IntInput defaultValue={asNumber(defaultData[key])} onChange={(value) => { handleChange(key, value) }} />
                    </FormControl>
                    break
                case 'float':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ color: 'white', fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <FloatInput defaultValue={asNumber(defaultData[key])} onChange={(value) => { handleChange(key, value) }} />
                    </FormControl>
                    break

                case 'color':
                    yield <FormControl key={key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <FormLabel
                            sx={{ color: 'white', fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <ColorInput defaultValue={asColor(defaultData[key])} onChange={(value) => { handleChange(key, value) }} />
                    </FormControl>
                    break

                case 'ranged_float':
                    yield <FormControl key={key}>
                        <FormLabel
                            sx={{ color: 'white', fontWeight: 'bold' }}>
                            {key}
                        </FormLabel>
                        <RangedFloatInput
                            defaultValue={asRangedFloat(defaultData[key])}
                            onChange={(value) => { handleChange(key, value) }}
                            min={value.metadata.min}
                            max={value.metadata.max} />
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