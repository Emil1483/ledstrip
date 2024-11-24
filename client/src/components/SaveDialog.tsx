import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
} from '@mui/material';

import { useSaveCurrentState } from '@/contexts/ModesContext';
import { icons } from '@/models/icons';

interface SaveDialogProps {
    open: boolean;
    onClose: () => void;
}


const SaveDialog: React.FC<SaveDialogProps> = ({ open, onClose }) => {
    const saveState = useSaveCurrentState();

    const [selectedIcon, setSelectedIcon] = useState<number>(0);

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());

        await saveState(formJson.name as string, selectedIcon);

        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                component: 'form',
                onSubmit: handleFormSubmit,
            }}
        >
            <DialogTitle>Name It!</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center' }}>
                    <FormControl required variant="outlined" sx={{ flex: 3, marginTop: 1 }}>
                        <InputLabel id="icon-select-label">Icon</InputLabel>
                        <Select
                            labelId="icon-select-label"
                            name="icon"
                            value={selectedIcon}
                            onChange={(event) => setSelectedIcon(event.target.value as number)}
                            label="Icon"
                        >
                            {icons.map(({ Icon, id }) => {
                                return <MenuItem key={id} value={id}>
                                    <Icon />
                                </MenuItem>
                            }
                            )}
                        </Select>
                    </FormControl>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="name"
                        label="Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        sx={{ flex: 6 }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="submit">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SaveDialog;