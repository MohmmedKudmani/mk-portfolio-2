// @ts-check
import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

import sitemap from '@astrojs/sitemap'

import cloudflare from '@astrojs/cloudflare'
import { sharpImageService } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  site: 'https://mk-portfolio.dev',

  build: {
    inlineStylesheets: 'always',
  },

  image: {
    service: sharpImageService(),
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap()],
  adapter: cloudflare(),
})