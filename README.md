# Browser Klasifikasi Arsip

Aplikasi web untuk browsing dan mencari klasifikasi arsip menggunakan **React** + **Vite** + **Tailwind CSS** dengan backend **Meilisearch**.

## Fitur

- 🔍 **Pencarian** — Cari klasifikasi berdasarkan kode atau deskripsi
- 📂 **Navigasi hierarki** — Telusuri klasifikasi dari level root hingga sub-klasifikasi
- ♾️ **Infinite Scroll** — Muat data otomatis saat scroll
- 🧭 **Breadcrumb** — Navigasi riwayat lokasi klasifikasi
- 📱 **Responsive** — Tampilan optimal di desktop & mobile

## Prasyarat

- **Node.js** v18+ dan **npm**
- **Meilisearch** v1.0+ (lokal atau server)

## Instalasi

### 1. Clone repositori

```bash
git clone https://github.com/yud1p3/browser_klasifikasi_arsip.git
cd browser_klasifikasi_arsip
```

### 2. Install dependensi

```bash
npm install
```

### 3. Setup Meilisearch

Pastikan Meilisearch berjalan dan memiliki index dengan dokumen klasifikasi.

Konfigurasi koneksi Meilisearch ada di `src/utils/constants.js`:

```js
export const SEARCH_DEFAULTS = {
  host: 'http://localhost:7700',
  apiKey: 'YOUR_MEILISEARCH_API_KEY',
  index: 'klasifikasi',
  limit: 20,
};
```

Atau gunakan **environment variable** saat build:

```bash
VITE_MEILISEARCH_HOST=http://localhost:7700 \
VITE_MEILISEARCH_API_KEY=your_key_here \
npm run build
```

### 4. Jalankan development server

```bash
npm run dev
```

Akses di `http://localhost:5173`

### 5. Build untuk production

```bash
npm run build
```

Hasil build ada di folder `dist/`

### 6. Deploy dengan Nginx (opsional)

Contoh konfigurasi nginx untuk proxy Meilisearch:

```nginx
server {
    listen 80;
    server_name klas-arsip.local;

    root /var/www/browser-klasifikasi-arsip;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /meili/ {
        proxy_pass http://127.0.0.1:7700/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Data Sampel

Folder `samples/` berisi contoh data CSV untuk diimport ke Meilisearch:

| File | Deskripsi |
|------|-----------|
| `klasifikasi_pengadaan.csv` | 25 baris data klasifikasi kode **027 (PENGADAAN)** — mencakup 6 level hierarki |

### Import ke Meilisearch

```bash
# Via curl
curl -X POST 'http://localhost:7700/indexes/klasifikasi/documents' \
  -H 'Content-Type: text/csv' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  --data-binary @samples/klasifikasi_pengadaan.csv
```

Atau via Meilisearch CLI:

```bash
meilisearch index documents --index klasifikasi samples/klasifikasi_pengadaan.csv --csv-delimiter ";"
```

> **Catatan:** File CSV menggunakan delimiter `;` (bukan koma) karena ada koma di dalam data.

## Struktur Proyek

```
src/
├── App.jsx              # Komponen utama dengan state & logic
├── main.jsx             # Entry point
├── index.css            # Style Tailwind
├── components/
│   ├── Breadcrumb.jsx   # Navigasi breadcrumb
│   ├── SearchBar.jsx    # Pencarian dengan mode sederhana/semantik
│   ├── ClassificationCard.jsx  # Card klasifikasi
│   ├── LoadingSkeleton.jsx     # Loading state
│   └── EmptyState.jsx  # State kosong/error/no-results
├── hooks/
│   ├── useMeilisearch.js       # Hook koneksi Meilisearch
│   ├── useInfiniteScroll.js    # Hook infinite scroll
│   └── useDebounce.js          # Hook debounce
└── utils/
    └── constants.js    # Konstanta & default config
```

## Tech Stack

- **React 19** — UI Library
- **Vite 6** — Build tool
- **Tailwind CSS 4** — Utility CSS
- **Meilisearch** — Search engine
- **meilisearch** — Client library
