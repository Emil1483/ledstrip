'use client'

import React from "react";
import { Slider } from "@mui/joy";

interface RangedFloatInputProps {
    onChange: (value: RangedFloat | null) => void;
    value: RangedFloat | undefined;
    min: number;
    max: number;
}

const RangedFloatInput: React.FC<RangedFloatInputProps> = ({ onChange, value, min, max }) => {
    return <Slider
        value={value?.value}
        min={min}
        max={max}
        onChange={(_, result) => onChange({ value: typeof result === 'number' ? result : result[0] })}
        step={0.01}
        valueLabelDisplay="auto"
    ></Slider>
}

export default RangedFloatInput