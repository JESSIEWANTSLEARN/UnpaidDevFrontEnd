import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const laravel = "http://127.0.0.1:8000";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],

    server: {
        port: 5173,

        proxy: {
            "/api": {
                target: laravel,
                changeOrigin: true,
            },

            "/storage": {
                target: laravel,
                changeOrigin: true,
            },

            "/login": {
                target: laravel,
                changeOrigin: true,
            },

            "/logout": {
                target: laravel,
                changeOrigin: true,
            },

            "/signup": {
                target: laravel,
                changeOrigin: true,
            },

            "/forgot-password": {
                target: laravel,
                changeOrigin: true,
            },
        },
    },
});
