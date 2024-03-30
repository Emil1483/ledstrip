import React, { Fragment, useState } from "react";
import ShadeSlider from '@uiw/react-color-shade-slider';
import Wheel from "@uiw/react-color-wheel";
import parseColor from 'parse-color'

interface ColorInputProps {
    onChange: (value: Color | null) => void;
}

const ColorInput: React.FC<ColorInputProps> = ({ onChange }) => {
    const [color, setColor] = useState({ h: 214, s: 43, v: 90, a: 1 })


    return <Fragment>
        <Wheel color={color} onChange={(c) => {
            setColor((color) => {
                const newColor = { ...color, ...c.hsva }
                console.log(newColor)

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
                    console.log(newColor)

                    const cString = `hsva(${newColor.h}, ${newColor.s}%, ${newColor.v}%, ${newColor.a})`
                    const [r, g, b] = parseColor(cString).rgb
                    onChange({ r, g, b })

                    return newColor
                })

            }} />
    </Fragment>
}

export default ColorInput