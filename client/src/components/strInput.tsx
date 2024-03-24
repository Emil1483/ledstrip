import * as React from 'react';
import { Input } from '@mui/joy';

interface StrInputProps {
    onChange: (value: string | null) => void;
}

const StrInput: React.FC<StrInputProps> = ({ onChange }) => {
    return (
        <Input
            type='text'
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
