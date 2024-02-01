import { GetServerSideProps } from "next";
import getConfig from "next/config";
import { useState } from "react";

const { publicRuntimeConfig } = getConfig();

interface ModesData {
    [key: string]: boolean;
}

interface HomeProps {
    modes: ModesData;
}

const Home: React.FC<HomeProps> = ({ modes }) => {
    const [currentModes, setModes] = useState<ModesData>(modes);
    const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

    const handleClick = async (mode: string) => {
        try {
            console.log(publicRuntimeConfig.API_URL)

            setLoadingStates(prevLoadingStates => ({
                ...prevLoadingStates,
                [mode]: true,
            }));

            await fetch(`${publicRuntimeConfig.API_URL}/modes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ set_mode: mode }),
            });

            setModes(prevModes => ({
                ...Object.keys(prevModes).reduce((acc: ModesData, key) => {
                    acc[key] = false;
                    return acc;
                }, {}),
                [mode]: true,
            }));

            const res = await fetch(`${publicRuntimeConfig.API_URL}/modes`);
            const latestModes: ModesData = await res.json();
            setModes(latestModes);
        } catch (error) {
            console.error('Error setting mode:', error);
        } finally {
            setLoadingStates(prevLoadingStates => ({
                ...prevLoadingStates,
                [mode]: false,
            }));
        }
    };

    return (
        <div>
            {Object.entries(currentModes).map(([key, value]) => (
                <button
                    key={key}
                    disabled={loadingStates[key] || value}
                    onClick={() => handleClick(key)}
                    style={{ marginRight: '10px' }}
                >
                    {loadingStates[key] ? 'Loading...' : key}
                </button>
            ))}
        </div>
    );
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
    const res = await fetch(`${process.env.API_URL}/modes`);
    const modes: { [key: string]: boolean } = await res.json();

    return {
        props: {
            modes
        }
    };
};

export default Home;
