import {
    Button, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';
import { useState } from 'react';

const useConfirm = (): [() => JSX.Element, (message: string) => Promise<boolean>] => {
    const [promise, setPromise] = useState<any>(null);
    const [message, setMessage] = useState<string>("");

    const confirm = (message: string) => new Promise((resolve: (value: boolean) => void, _) => {
        setMessage(message);
        setPromise({ resolve });
    });

    const handleClose = () => {
        setPromise(null);
    };

    const handleConfirm = () => {
        promise?.resolve(true);
        handleClose();
    };

    const handleCancel = () => {
        promise?.resolve(false);
        handleClose();
    };
    // You could replace the Dialog with your library's version
    const ConfirmationDialog = () => (
        <Dialog
            open={promise !== null}
            fullWidth
        >
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleConfirm}>Yes</Button>
                <Button onClick={handleCancel}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );

    return [ConfirmationDialog, confirm];
};

export default useConfirm;