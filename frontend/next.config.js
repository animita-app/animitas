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
    return [];
  },
  async rewrites() {
    return [
      {
        source: '/@:username',
        destination: '/profile/:username',
      },
    ];
  },

};

module.exports = nextConfig;
