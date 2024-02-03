import { GetServerSideProps } from "next";
import getConfig from "next/config";
import { useState } from "react";

const { publicRuntimeConfig } = getConfig();

interface ModesData {
    [key: string]: {
        on: boolean;
        kwargs: {
            [key: string]: "str" | "float";
        };
    };
}

interface HomeProps {
    modes: ModesData;
}

interface ModeForm {
    [key: string]: string | number;
}

const Home: React.FC<HomeProps> = ({ modes }) => {
    const [formData, setFormData] = useState<ModeForm>({});

    const handleSubmit = async (mode: string) => {
        const parsedFormData: ModeForm = {};
        for (const key of Object.keys(modes[mode].kwargs)) {
            const value = formData[key]
            if (!value) continue
            switch (modes[mode].kwargs[key]) {
                case 'float':
                    parsedFormData[key] = parseFloat(value as string);
                    break;
                case 'str':
                    parsedFormData[key] = value;
                    break;
                default:
                    throw new Error('Invalid type');
            }
        }

        const payload = {
            mode,
            kwargs: parsedFormData
        };

        try {
            const response = await fetch(`${publicRuntimeConfig.API_URL}/modes`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                console.log('Data submitted successfully');
            } else {
                console.error('Error submitting data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleInputChange = (key: string, value: string | number) => {
        setFormData(prevData => ({
            ...prevData,
            [key]: value
        }));
    };

    return (
        <div>
            {Object.entries(modes).map(([key, mode]) => (
                <div key={key}>
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(key); }}>
                        {Object.entries(mode.kwargs).map(([kwargKey, type]) => (
                            <div key={kwargKey}>
                                <label htmlFor={kwargKey}>{kwargKey}</label>
                                <input
                                    type={{ str: 'text', float: 'number' }[type]}
                                    id={kwargKey}
                                    name={kwargKey}
                                    value={formData[kwargKey] || ''}
                                    onChange={(e) => handleInputChange(kwargKey, e.target.value)}
                                />
                            </div>
                        ))}
                    </form>
                    <button onClick={() => handleSubmit(key)}>
                        {key}
                    </button>
                    {mode.on ? "On" : "Off"}
                </div>
            ))}
        </div>
    );
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
    const res = await fetch(`${process.env.API_URL}/modes`);

    const modes = await res.json();

    return {
        props: {
            modes
        }
    };
};

export default Home;
