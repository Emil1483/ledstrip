import React, { Fragment, useState } from "react";
import ShadeSlider from '@uiw/react-color-shade-slider';
import Wheel from "@uiw/react-color-wheel";
import parseColor from 'parse-color'

interface ColorInputProps {
    onChange: (value: Color | null) => void;
    defaultValue: Color | undefined;
}

function toHSVA(color: Color): { h: number, s: number, v: number, a: number } {
    const cString = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`
    const [h, s, v, a] = parseColor(cString).hsva
    return { h, s, v, a }
}

const ColorInput: React.FC<ColorInputProps> = ({ onChange, defaultValue }) => {
    const [color, setColor] = useState(toHSVA(defaultValue || { r: 131, g: 174, b: 230 }))

    return <Fragment>
        <Wheel color={color} onChange={(c) => {
            setColor((color) => {
                const newColor = { ...color, ...c.hsva }

                const cString = `hsva(${newColor.h}, ${newColor.s}%, ${newColor.v}%, ${newColor.a})`
                const [r, g, b] = parseColor(cString).rgb
                onChange({ r, g, b })

                return newColor
            })

        }} />
        <ShadeSlider
            hsva={color}
            style={{ width: 210, marginTop: 20 }}
            onChange={(c) => {
                setColor((color) => {
                    const newColor = { ...color, ...c }

                    const cString = `hsva(${newColor.h}, ${newColor.s}%, ${newColor.v}%, ${newColor.a})`
                    const [r, g, b] = parseColor(cString).rgb
                    onChange({ r, g, b })

                    return newColor
                })

            }} />
    </Fragment>
}

export default ColorInput