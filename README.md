# Mehmet Tüysüz Portfolio

Mehmet Tüysüz'ün Computer Vision, LLM çalışmaları ve agentic yazılım sistemleri üzerine yaptığı projeleri paylaştığı kişisel site.

## Özellikler

- Türkçe ve İngilizce içerik
- Paylaşılabilir, yerelleştirilmiş proje bağlantıları
- Ana sayfadan açılan erişilebilir proje detay pencereleri
- Doğrudan URL'de tam sayfa proje görünümü
- Dil değişiminde aynı sayfa, proje ve kaydırma konumunun korunması
- Vercel Web Analytics entegrasyonu
- Route-aware metadata, canonical, hreflang, sitemap ve 404 çıktıları
- Reduced-motion desteği ve klavye erişimi

## Teknolojiler

- React 19
- TypeScript
- Vite
- Radix Toggle Group tabanlı dil seçici
- Vercel Web Analytics
- Vitest ve Testing Library

## Yerel geliştirme

```bash
npm install
npm run dev
```

Varsayılan geliştirme adresi `http://127.0.0.1:5173` olur.

## Kontroller

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run verify:build
```

## Rotalar

- `/tr` ve `/en`
- `/tr/projeler/:slug`
- `/en/projects/:slug`

Eski `/` ve `/projeler/:slug` bağlantıları Türkçe canonical rotalara yönlendirilir.

## Dağıtım

Proje Vercel için hazırlanmıştır. Production build `dist/` klasörüne yazılır. `VITE_SITE_URL`, canonical ve sitemap adresini farklı bir domain için değiştirmek amacıyla kullanılabilir.

```bash
VITE_SITE_URL=https://example.com npm run build
```

Vercel Web Analytics temel ziyaret ve sayfa görüntüleme bilgilerini cookiesiz biçimde toplar. Özel etkinlik takibi kullanılmaz.
