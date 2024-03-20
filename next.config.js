/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    async headers() {
        return [
            {
                source: '/api',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store, max-age=0',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
