import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        baseUrl: process.env.BASE_URL || "http://localhost:3002",
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
});
