import * as cookie from 'cookie'

import { GetServerSideProps } from "next";
import React from "react";

interface PageProps {
    title: string;
}

const Home: React.FC<PageProps> = ({ title }) => {
    return <p>{title}</p>
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
    const { req, res } = context;

    const unparsedCookie = req.headers.cookie
    if (!unparsedCookie) {
        return {
            props: {
                title: "Missing cookie header"
            }
        };
    }

    const parsedCookies = cookie.parse(unparsedCookie);
    const token = parsedCookies.portainerJwtToken;

    if (!token) {
        return {
            props: {
                title: "Missing token"
            }
        };
    }

    // TODO: validate token

    return {
        props: {
            title: token
        }
    };
};


export default Home;
