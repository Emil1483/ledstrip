import { LedStripsComponent } from "@/components/LedStripsComponent";
import { LedStripProvider } from "@/contexts/LedStripsContext";

export default function Page() {
    return <LedStripProvider>
        <LedStripsComponent />
    </LedStripProvider>
}