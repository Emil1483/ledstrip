import { verifyPatch } from "next-ws/server/index.js";
verifyPatch()

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
};

export default nextConfig;
