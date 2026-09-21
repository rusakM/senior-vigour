import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    server: {
        host: "0.0.0.0",
        port: 3000,
        proxy: {
            "/api": {
                target: "http://localhost:8081",
                changeOrigin: true,
                ws: false,
            },
            "/cdn": {
                target: "http://localhost",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/cdn/, "/cdn/"),
            },
        },
    },
    plugins: [react()],
    resolve: {
        alias: {
            "@styles": path.resolve(__dirname, "./src/styles"),
        },
    },
});
