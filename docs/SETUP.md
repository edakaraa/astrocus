# Astrocus Setup

## Mobil Uygulama

```bash
npm install
npm start
```

## API

```bash
cd server
npm install
npm run dev
```

API varsayilan olarak `http://localhost:4000` uzerinden calisir.

## Typecheck

```bash
npm run typecheck
npm --prefix server run typecheck
```

## Notlar

- API dosya tabanli basit bir JSON depolama kullanir.
- Offline seanslar cihaz tarafinda saklanir ve sonra senkronize edilir.
- Social auth butonlari MVP demo akisi icin provider tabanli gelistirme girisi olusturur.
