import * as React from 'react';
import { Input } from '@mui/joy';

interface IntInputProps {
    onChange: (value: number | null) => void;
}

const IntInput: React.FC<IntInputProps> = ({ onChange }) => {
    return (
        <Input
            type='number'
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
