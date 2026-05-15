# Dershane Otomasyon Sistemi

Bu repo, dershane otomasyon projesinin monorepo yapisini icerir.

## Klasorler

- `backend`: Node.js API ve PostgreSQL baglantisi
- `web`: React tabanli yonetim paneli
- `mobile`: React Native tabanli ogrenci/veli uygulamasi
- `docs`: analiz, UML ve teknik notlar

## Ilk Kurulum

1. `npm install`
2. `npm run dev:backend`
3. `npm run dev:web`
4. `npm run dev:mobile`

## Docker ile Calistirma

1. `backend/.env.example` dosyasini `backend/.env` olarak kopyalayin.
2. Kök dizindeki `.env.example` dosyasini `.env` olarak kopyalayin.
3. `docker compose up --build` komutunu calistirin.

## Backend Testleri

1. Docker servisleri ayaktayken `backend` klasorunde bagimliliklari kurun.
2. `npm run test:integration` komutunu calistirin.
3. API endpoint listesi: `backend/docs/API.md`

## Roller

- Oğuz: frontend + mobile
- Emirhan: database + backend
