import React, { Fragment, useState } from "react";
import ShadeSlider from '@uiw/react-color-shade-slider';
import Wheel from "@uiw/react-color-wheel";
import parseColor from 'parse-color'

interface ColorInputProps {
    onChange: (value: Color | null) => void;
    value: Color | undefined;
}

function toHSVA(color: Color | undefined): { h: number, s: number, v: number, a: number } {
    if (!color) {
        return { h: 0, s: 0, v: 0, a: 0 }
    }
    const cString = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`
    const [h, s, v, a] = parseColor(cString).hsva
    return { h, s, v, a }
}

const ColorInput: React.FC<ColorInputProps> = ({ onChange, value }) => {
    return <Fragment>
        <Wheel color={toHSVA(value)} onChange={(c) => {
            const newColor = { ...toHSVA(value), ...c.hsva }

            const cString = `hsva(${newColor.h}, ${newColor.s}%, ${newColor.v}%, ${newColor.a})`
            const [r, g, b] = parseColor(cString).rgb
            onChange({ r, g, b })

            return newColor

        }} />
        <ShadeSlider
            hsva={toHSVA(value)}
            style={{ width: 210, marginTop: 20 }}
            onChange={(c) => {
                const newColor = { ...toHSVA(value), ...c }

                const cString = `hsva(${newColor.h}, ${newColor.s}%, ${newColor.v}%, ${newColor.a})`
                const [r, g, b] = parseColor(cString).rgb
                onChange({ r, g, b })

                return newColor

            }} />
    </Fragment>
}

export default ColorInput