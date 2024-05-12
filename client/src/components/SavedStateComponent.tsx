import BookmarkIcon from '@mui/icons-material/Bookmark';
import useConfirm from "@/hooks/useConfirm"
import { useSavedStatesStore } from "@/hooks/useSavedStatesStore"
import { Button, ThemeProvider, createTheme } from "@mui/material"
import { LongPressFns } from "@uidotdev/usehooks"
import { useShallow } from "zustand/react/shallow"
import { isColor } from '@/models/typeCheckers';

interface SavedStateComponentProps {
    state: ModeState,
    index: number,
    longPressFns: LongPressFns
    onClick: () => void
    id: string
}

function generateColor(state: ModeState) {
    if (Object.keys(state).length === 1) {
        const key = Object.keys(state)[0]
        const value = state[key]
        if (isColor(value)) {
            return `rgb(${value.r},${value.g},${value.b})`
        }
    }

    return "#5C76B7"
}

export const SavedStateComponent: React.FC<SavedStateComponentProps> = ({ index, state, longPressFns, onClick, id }) => {
    const color = generateColor(state)

    return <ThemeProvider theme={createTheme({
        palette: {
            primary: {
                main: color
            }
        }

    })}>
        <Button
            {...longPressFns}
            onClick={onClick}
            variant="contained"
            key={index}
            id={id}
            sx={{
                marginRight: '8px',
                marginLeft: '8px',
                marginBottom: '8px',
            }}>
            <BookmarkIcon />
        </Button>
    </ThemeProvider>

}