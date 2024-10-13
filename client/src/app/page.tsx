import { LedStripsComponent } from "@/components/LedStripsComponent";
import { LedStripProvider } from "@/contexts/LedStripsContext";
import { MQTTProvider } from "@/contexts/MQTTContext";

export default async function Page() {
    return <MQTTProvider>
        <LedStripProvider>
            <LedStripsComponent />
        </LedStripProvider>
    </MQTTProvider>
}