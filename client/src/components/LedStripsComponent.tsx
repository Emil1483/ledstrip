'use client'

import React from "react";
import { AppBarComponent } from "@/components/AppBarComponent";
import { useLedStrips } from "@/contexts/LedStripsContext";
import { Box, Divider, List, ListItemButton, ListItemText, Typography } from '@mui/material';



export const LedStripsComponent: React.FC = () => {
    const ledStrips = useLedStrips()

    const calculateOpacity = (value: number): number => {
        return Math.max(0, Math.min(2, 2 - value)) / 2;
    };

    return <>
        <AppBarComponent />
        <div>
            <Typography variant="h4" gutterBottom>
                LED Strips List
            </Typography>
            <List sx={{ width: '100%' }}>
                {ledStrips.map((strip) => <React.Fragment key={strip.id}>
                    <ListItemButton key={strip.id} component="a" href={`/${strip.id}`}>
                        <ListItemText primary={`ID: ${strip.id}`} />
                        <Box
                            sx={{
                                padding: '4px 10px',
                                borderRadius: '32px',
                                backgroundColor: `rgba(0, 255, 0, ${calculateOpacity(strip.aliveFor)})`, // Green to transparent
                                textAlign: 'right',
                            }}
                        >
                            <Typography variant="body2">
                                {strip.aliveFor.toFixed(2)}
                            </Typography>
                        </Box>
                    </ListItemButton>
                    <Divider />
                </React.Fragment>
                )}
            </List>
        </div>
    </>
};