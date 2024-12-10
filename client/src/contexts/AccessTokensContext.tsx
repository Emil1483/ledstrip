"use client";

import { useAuth } from "@clerk/nextjs";
import { createContext, ReactNode, useState, useContext } from "react";
import { toast } from "react-toastify";

const AccessTokensContext = createContext<AccessToken[]>([]);
const CreateAccessTokenContext = createContext<() => void>(() => { });
const DeleteAccessTokenContext = createContext<(id: number) => void>(() => { });


interface AccessToken {
    id: number;
    token: string;
}

interface AccessTokensProviderProps {
    children: ReactNode;
    initialAccessTokens: AccessToken[];
}

export const AccessTokensProvider: React.FC<AccessTokensProviderProps> = ({ children, initialAccessTokens }) => {
    const [accessTokens, setAccessTokens] = useState<AccessToken[]>(initialAccessTokens);
    const { userId } = useAuth();

    async function createAccessToken() {
        const response = await fetch(`/api/users/${userId}/accessTokens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const newTokens: AccessToken[] = await response.json();
            setAccessTokens(newTokens);
        } else {
            toast.error('Failed to create access token');
        }
    }

    async function deleteAccessToken(id: number) {
        const response = await fetch(`/api/users/${userId}/accessTokens/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            const newTokens: AccessToken[] = await response.json();
            setAccessTokens(newTokens);
        } else {
            toast.error('Failed to delete access token');
        }
    }

    return <AccessTokensContext.Provider value={accessTokens}>
        <CreateAccessTokenContext.Provider value={createAccessToken}>
            <DeleteAccessTokenContext.Provider value={deleteAccessToken}>
                {children}
            </DeleteAccessTokenContext.Provider>
        </CreateAccessTokenContext.Provider>
    </AccessTokensContext.Provider>
};


export function useAccessTokens() {
    const context = useContext(AccessTokensContext);
    if (!context) {
        throw new Error('useCurrentModes must be used within a ModesProvider');
    }
    return context;
}

export function useCreateAccessToken() {
    const context = useContext(CreateAccessTokenContext);
    if (!context) {
        throw new Error('useChangeMode must be used within a ModesProvider');
    }
    return context;
}

export function useDeleteAccessToken() {
    const context = useContext(DeleteAccessTokenContext);
    if (!context) {
        throw new Error('useChangeMode must be used within a ModesProvider');
    }
    return context;
}