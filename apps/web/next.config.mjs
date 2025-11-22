/** @type {import('next').NextConfig} */
export default {
  transpilePackages: ["@repo/ui", "@repo/common", "@repo/backend-common"],
  output: 'standalone',
};
