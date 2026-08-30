import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Budgetly',
    short_name: 'Budgetly',
    description: 'A modern personal finance and budgeting application built for students',
    start_url: '/',
    display: 'standalone',
    background_color: '#F6F8FC',
    theme_color: '#1A56DB',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/splash-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
