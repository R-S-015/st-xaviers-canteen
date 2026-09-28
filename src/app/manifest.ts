import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Canteen Connect',
    short_name: 'Canteen',
    description: 'Order your favorite food directly from St. Xavier\'s Canteen.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F2EAE0',
    theme_color: '#4A3C31',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
