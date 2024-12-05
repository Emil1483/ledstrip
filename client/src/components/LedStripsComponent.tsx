'use client'

import React from "react";
import { useLedStrips } from "@/contexts/LedStripsContext";
import { Box, Divider, List, ListItemButton, ListItemText } from '@mui/material';
import Link from "next/link";



export const LedStripsComponent: React.FC = () => {
    const ledstrips = useLedStrips()

    function color(aliveFor: number | undefined) {
        if (aliveFor == undefined) {
            return "grey"
        }
        if (aliveFor < 2) {
            const opacity = 1 - aliveFor / 2
            return `rgba(0, 255, 0, ${opacity})`
        }

        const opacity = Math.min(1, (aliveFor - 2) / 2)
        return `rgba(255, 0, 0, ${opacity})`
    }

    return <List sx={{ padding: "0px" }}>
        {ledstrips.map((strip) => <React.Fragment key={strip.id}>
            <Link href={`/ledstrips/${strip.id}`} passHref legacyBehavior>
                <ListItemButton
                    className="led-strip-button"
                    key={strip.id}
                    sx={{
                        padding: 0,
                        margin: 0,
                        display: 'flex',
                        height: '64px',
                    }}
                    disabled={strip.aliveFor == undefined} >
                    <Box
                        sx={{
                            width: "8px",
                            height: "100%",
                            backgroundColor: color(strip.aliveFor),
                            marginRight: "16px",
                        }}
                    />
                    <ListItemText primary={strip.name} />
                </ListItemButton>
            </Link>
            <Divider />
        </React.Fragment>
        )}
    </List>
};