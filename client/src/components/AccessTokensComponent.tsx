import { useAccessTokens, useCreateAccessToken, useDeleteAccessToken } from '@/contexts/AccessTokensContext';
import { Button, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import React from 'react';

export const AccessTokensComponent: React.FC = () => {
    const tokens = useAccessTokens();
    const addToken = useCreateAccessToken();
    const deleteToken = useDeleteAccessToken();

    return (
        <div>
            <List>
                {tokens.map((token, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={token.token} />
                        <IconButton edge="end" aria-label="delete" onClick={() => deleteToken(token.id)}>
                            <DeleteIcon />
                        </IconButton>
                    </ListItem>
                ))}
            </List>
            <Button variant="contained" color="primary" onClick={addToken}>
                Add Access Token
            </Button>
        </div>
    );
};