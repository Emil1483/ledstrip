'use client'

import { TextField } from "@mui/material";

interface IntInputProps {
    onChange: (value: number | null) => void;
    value: number | undefined;
}

const IntInput: React.FC<IntInputProps> = ({ onChange, value }) => {
    return (
        <TextField
            inputProps={{ type: 'number' }}
            value={value ?? ''}
            onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                    onChange(null);
                } else {
                    onChange(parseInt(value));
                }
            }}
        />
    );
};

export default IntInput;
