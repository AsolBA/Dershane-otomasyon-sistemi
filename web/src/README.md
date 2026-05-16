# Web Uygulamasi

Admin, mudur ve ogretmen paneli.

## Service layer

- `src/services/index.js` — mock veya gercek API secimi
- `VITE_USE_MOCK_API=true` (varsayilan) → `src/services/mock/*`
- `VITE_USE_MOCK_API=false` → `src/services/api/*` + `VITE_API_BASE_URL`

Ornek: `web/.env.example` dosyasini `web/.env` olarak kopyala.
