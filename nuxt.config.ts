import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
		'@nuxt/icon',
    '@nuxtjs/i18n',
    '@pinia/nuxt'
  ],
  i18n: {
    locales: [
      { code: 'en', name: 'en-US', file: 'en.json' },
      { code: 'tr', name: 'tr-TR', file: 'tr.json' },
      // İhtiyacınız olan diğer dilleri buraya ekleyebilirsiniz
    ],
    defaultLocale: 'tr', // Varsayılan dil
    strategy: 'prefix_except_default', // URL stratejisi (örn: /en/about, /tr/hakkimizda)
    // Eğer tarayıcı dilini otomatik algılamasını isterseniz:
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root', // root'ta yönlendirme yapar
    }
  },
  colorMode: {
    classSuffix: '', // Tailwind CSS'in dark moduyla uyumlu çalışması için gerekli
    preference: 'system', // Varsayılan tercih
    fallback: 'dark', // Sistem tercihi yoksa veya desteklenmiyorsa kullanılacak tema
  },
  css: [
    '~/assets/css/tailwind.css',
    'flag-icons/css/flag-icons.min.css' // Minified olmayan versiyonu kullanıldı
  ],
  build: {
    transpile: []
  }
})
