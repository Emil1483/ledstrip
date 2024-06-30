'use client'

import { Input } from "@mui/joy"
import React from "react";

interface FloatInputProps {
    onChange: (value: number | null) => void;
    value: number | undefined;
}

const FloatInput: React.FC<FloatInputProps> = ({ onChange, value }) => {
    return <Input
        type='number'
        value={value}
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