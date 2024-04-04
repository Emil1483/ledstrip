import * as React from 'react';
import { Input } from '@mui/joy';

interface StrInputProps {
    onChange: (value: string | null) => void;
    defaultValue: string | undefined;
}

const StrInput: React.FC<StrInputProps> = ({ onChange, defaultValue }) => {
    return (
        <Input
            type='text'
            defaultValue={defaultValue}
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
