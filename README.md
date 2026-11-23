# iklan-properti

Project ini dibuat oleh Setup Manual TampilKit Studio dari paket resmi.

## Struktur

- `backend/` API (port internal 4000)
- `frontend/` aplikasi web (port publik, memanggil `/api`)
- `scripts/` menjalankan keduanya sekaligus
- `prisma/schema.prisma` skema database

## Menjalankan

- Development: `npm run dev`
- Produksi: `npm run build` lalu `npm start`

## Database

Database PostgreSQL dibuat otomatis dan alamatnya ada di file `.env` (jangan dibagikan atau di-commit).
Terapkan perubahan skema dengan `npx prisma db push`.
