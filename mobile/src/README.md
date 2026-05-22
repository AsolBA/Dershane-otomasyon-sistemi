# Mobile (Ogrenci & Veli)

Expo + React Navigation. Ogrenci ve veli rolleri icin ayri tab navigasyonu.

## Calistirma

```bash
cd mobile
npm install
npm run dev
```

Telefonda Expo Go ile QR okut veya `a` / `i` ile emulator.

Kok dizinden: `npm run dev:mobile`

## Mock giris

Login ekraninda rol sec (Ogrenci / Veli). Mock modda sifre kontrolu yok; e-posta istege bagli.

- **Ogrenci:** sinavlar, program, duyurular, bildirimler
- **Veli:** bagli ogrenci devamsizligi, sinavlar, duyurular, bildirimler

Ana sayfada ozet kartlari; listelerde asagi cekerek yenileme (pull-to-refresh).

## Mock / API

`mobile/.env` (ornek: `.env.example`):

- `EXPO_PUBLIC_USE_MOCK_API=true` — mock veri (varsayilan)
- `EXPO_PUBLIC_USE_MOCK_API=false` — backend API (`EXPO_PUBLIC_API_BASE_URL`)

Backend hazir oldugunda:

```env
EXPO_PUBLIC_USE_MOCK_API=false
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

Emulatorde Android icin `10.0.2.2:4000`, fiziksel cihazda bilgisayar IP adresi kullan.

## Yapi

- `src/auth/` — AsyncStorage oturum, AuthContext
- `src/services/mock/` ve `src/services/api/` — `services/index.js` uzerinden secim
- `src/screens/student|parent|shared/` — ekranlar
- `src/components/` — RefreshableScreen, StatCard
- `src/navigation/` — AppNavigator, StudentTabs, ParentTabs
