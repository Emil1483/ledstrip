import { Input } from "@mui/joy"
import React from "react";

interface FloatInputProps {
    onChange: (value: number | null) => void;
}

const FloatInput: React.FC<FloatInputProps> = ({ onChange }) => {
    return <Input
        type='number'
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