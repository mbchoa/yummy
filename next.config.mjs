// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
import createNextRouteConfig from "nextjs-routes/config";
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

const withRoutes = createNextRouteConfig();

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};
export default withRoutes(config);
