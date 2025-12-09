/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'images.mapillary.com',
      },
      {
        protocol: 'https',
        hostname: 'streetviewpixels-pa.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.diarioconcepcion.cl',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'fotografiapatrimonial.cl',
      },
      {
        protocol: 'https',
        hostname: 'images2-mega.cdn.mdstrm.com',
      },
      {
        protocol: 'https',
        hostname: 'lavozdelosquesobran.cl',
      },
      {
        protocol: 'https',
        hostname: 'masquecultura.cl',
      },
      {
        protocol: 'https',
        hostname: 'media.biobiochile.cl',
      },
      {
        protocol: 'https',
        hostname: 'www.chilevision.cl',
      },
      {
        protocol: 'https',
        hostname: 'www.memoriachilena.gob.cl',
      },
      {
        protocol: 'https',
        hostname: 'www.memoriasdelsigloxx.cl',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },

};

module.exports = nextConfig;
