import { clerkSetup } from '@clerk/testing/cypress'
import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        // baseUrl: process.env.BASE_URL || "http://172.17.0.1:3000",
        baseUrl: process.env.BASE_URL || "http://127.0.0.1:3000",
        setupNodeEvents(on, config) {
            return clerkSetup({ config })
        },
    },
});
