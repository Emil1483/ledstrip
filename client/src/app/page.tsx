'use client'

import { List, ListItem, ListItemText, Box, Container } from '@mui/material';

const LedStripsComponent: React.FC = () => {



    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.paper'
            }}
        >
            <Container
                maxWidth="sm"
                sx={{ height: '100%', overflowY: 'auto' }}
            >
                <List>
                    {items.map((item, index) => (
                        <ListItem key={index} divider>
                            <ListItemText primary={item} />
                        </ListItem>
                    ))}
                </List>
            </Container>
        </Box>
    );
}

export default LedStripsComponent