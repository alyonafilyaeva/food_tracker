import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Приложение полностью клиентское и персонализированное (авторизация, дашборд) —
     экспериментальный статический shell/PPR только мешает, поэтому выключен */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
