# Health Monitor favicon / PWA icons

## Перенести файлы в папку public

Итоговая структура в `public`:

```text
public/
├── favicon.ico
├── manifest.webmanifest
└── icons/
    ├── apple-touch-icon.png
    ├── icon-16x16.png
    ├── icon-32x32.png
    ├── icon-192x192.png
    └── icon-512x512.png
```


## Подключение в Nuxt 4

В `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' }
      ],
      meta: [
        { name: 'theme-color', content: '#FF5A1F' }
      ]
    }
  }
})
```
