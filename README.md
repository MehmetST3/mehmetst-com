# Mehmet Tüysüz

Bilgisayarla görme, LLM çalışmaları ve agentic yazılım sistemleri üzerine projelerimi paylaştığım kişisel portfolyo sitesi.

**Canlı site:** https://mehmetst-com.vercel.app

## Öne çıkanlar

- Türkçe ve İngilizce yerelleştirilmiş rotalar ve içerikler
- Ana sayfada erişilebilir modal, paylaşılabilir bağlantılarda doğrudan proje detay görünümü
- Canonical, hreflang, Open Graph, sitemap, robots ve 404 için statik SEO çıktıları
- Farklı ekranlara ve reduced-motion tercihine uyumlu native-dark tasarım

## Teknolojiler

- React
- TypeScript
- Vite
- Radix UI
- Vitest ve Testing Library
- Vercel Analytics

## Gereksinimler

- Node.js `^20.19.0 || >=22.12.0`
- npm

## Hızlı başlangıç

```bash
npm ci
npm run dev
```

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Yerel geliştirme sunucusunu başlatır. |
| `npm run build` | TypeScript kontrolünü çalıştırır, `dist/` çıktısını üretir ve çıktıyı doğrular. |
| `npm run lint` | ESLint denetimini çalıştırır. |
| `npm run typecheck` | TypeScript proje kontrolünü çalıştırır. |
| `npm test` | Testleri tek sefer çalıştırır. |
| `npm run test:watch` | Testleri izleme modunda çalıştırır. |
| `npm run verify:build` | Mevcut `dist/` içindeki statik rotaları ve SEO çıktılarını doğrular. |

## Dağıtım

Vercel, üretim derlemesindeki `dist/` dizinini sunar. Farklı bir canonical origin kullanmak için derleme sırasında isteğe bağlı `VITE_SITE_URL` ortam değişkeni tanımlanabilir.
