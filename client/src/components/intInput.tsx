import * as React from 'react';
import { Input } from '@mui/joy';

interface IntInputProps {
    onChange: (value: number | null) => void;
    defaultValue: number | undefined;
}

const IntInput: React.FC<IntInputProps> = ({ onChange, defaultValue }) => {
    return (
        <Input
            type='number'
            defaultValue={defaultValue}
            onChange={(event) => {
                const value = parseFloat(event.target.value)
                if (isNaN(value)) {
                    onChange(null)
                } else {
                    onChange(value)
                }
            }}
            onKeyDown={(event) => {
                if (["Tab", "Backspace"].includes(event.key)) {
                    return
                }
                if (isNaN(parseFloat(event.key))) {
                    event.preventDefault();
                }
            }}
        />
    );
};

export default IntInput;
