import { useAccessTokens, useCreateAccessToken, useDeleteAccessToken } from '@/contexts/AccessTokensContext';
import { Button, List, ListItem, ListItemText, IconButton, Divider } from '@mui/material';
import { Delete, ContentCopy } from '@mui/icons-material';
import React from 'react';
import { toast, ToastContainer } from 'react-toastify';

export const AccessTokensComponent: React.FC = () => {
    const tokens = useAccessTokens();
    const addToken = useCreateAccessToken();
    const deleteToken = useDeleteAccessToken();

    async function handleCopy(token: string) {
        navigator.clipboard.writeText(token)
            .then(() => {
                toast.success('Token copied to clipboard');
            })
            .catch(() => {
                toast.error('Failed to copy token to clipboard');
            });
    }

    return (
        <>
            <List>
                {tokens.map((token, index) => (
                    <>
                        <ListItem key={index}>
                            <IconButton edge="end" aria-label="copy" onClick={() => handleCopy(token.token)} sx={{
                                margin: 0,
                            }}>
                                <ContentCopy />
                            </IconButton>
                            <ListItemText primary={token.token} />
                            <IconButton edge="end" aria-label="delete" onClick={() => deleteToken(token.id)}>
                                <Delete />
                            </IconButton>
                        </ListItem>
                        <Divider />
                    </>

                ))}
            </List>
            <Button variant="contained" color="primary" onClick={addToken}>
                Add Access Token
            </Button>
            <ToastContainer />
        </>
    );
};