import { GetServerSideProps } from "next";
import React from "react";

interface PageProps {
    title: string;
}

const Home: React.FC<PageProps> = ({ title }) => {
    return <p>{title}</p>
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
    return {
        props: {
            title: "Secret Data"
        }
    };
};


export default Home;
