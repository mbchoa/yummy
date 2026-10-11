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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.fl.yelpcdn.com",
      },
      // Auth0 user pictures: Gravatar (database/passwordless), Auth0's
      // default-avatar CDN, and GitHub social connections.
      { protocol: "https", hostname: "s.gravatar.com" },
      { protocol: "https", hostname: "www.gravatar.com" },
      { protocol: "https", hostname: "cdn.auth0.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};
export default withRoutes(config);
