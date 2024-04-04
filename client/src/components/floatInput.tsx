import { Input } from "@mui/joy"
import React from "react";

interface FloatInputProps {
    onChange: (value: number | null) => void;
    defaultValue: number | undefined;
}

const FloatInput: React.FC<FloatInputProps> = ({ onChange, defaultValue }) => {
    return <Input
        type='number'
        defaultValue={defaultValue}
        slotProps={{
            input: {
                step: 'any'
            }
        }}
        onChange={(event) => {
            const value = parseFloat(event.target.value)
            if (isNaN(value)) {
                onChange(null)
            } else {
                onChange(value)
            }
        }}
    />
}

export default FloatInput