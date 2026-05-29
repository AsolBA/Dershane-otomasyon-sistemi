# Web Uygulaması

Yönetici, müdür, öğretmen, öğrenci ve veli paneli.

## Service layer

- `src/services/index.js` — mock veya gerçek API seçimi
- `VITE_USE_MOCK_API=true` (varsayılan) → `src/services/mock/*`
- `VITE_USE_MOCK_API=false` → `src/services/api/*` + `VITE_API_BASE_URL`

Örnek: `web/.env.example` dosyasını `web/.env` olarak kopyala.
