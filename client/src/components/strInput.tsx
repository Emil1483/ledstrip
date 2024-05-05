import * as React from 'react';
import { Input } from '@mui/joy';

interface StrInputProps {
    onChange: (value: string | null) => void;
    value: string | undefined;
}

const StrInput: React.FC<StrInputProps> = ({ onChange, value }) => {
    return (
        <Input
            type='text'
            value={value}
            onChange={(event) => {
                if (event.target.value === "") {
                    onChange(null)
                } else {
                    onChange(event.target.value)
                }
            }}
        />
    );
};

export default StrInput;
