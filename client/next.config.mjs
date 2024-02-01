/** @type {import('next').NextConfig} */
const nextConfig = {
    publicRuntimeConfig: {
        API_URL: process.env.API_URL,
    },
};

export default nextConfig;
