import { Home, Favorite, Flight, Lightbulb } from "@mui/icons-material";
import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";

interface IconOption {
    id: number;
    Icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
        muiName: string;
    };
}

export const icons: IconOption[] = [
    { id: 0, Icon: Home },
    { id: 1, Icon: Flight },
    { id: 2, Icon: Favorite },
    { id: 3, Icon: Lightbulb },
];
