/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/tournament/admin',
        destination: '/admin',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
