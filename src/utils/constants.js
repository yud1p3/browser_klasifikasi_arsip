// Konfigurasi aplikasi
export const MEILISEARCH_CONFIG = {
  host: import.meta.env.VITE_MEILISEARCH_HOST || `${window.location.protocol}//${window.location.host}/meili`,
  apiKey: import.meta.env.VITE_MEILISEARCH_API_KEY || 'ganti-dengan-api-key-anda',
  indexName: import.meta.env.VITE_MEILISEARCH_INDEX || 'klasifikasi',
};

// Mapping penyusutan_id
export const PENYUSUTAN_MAP = {
  0: '-',
  1: 'Musnah',
  2: 'Permanen',
  4: 'Dinilai kembali',
};

export const getPenyusutanLabel = (id) => {
  const num = Number(id);
  return PENYUSUTAN_MAP[num] ?? `Tidak diketahui (${id})`;
};

// Default search parameters
export const SEARCH_DEFAULTS = {
  limit: 20,
  attributesToRetrieve: [
    'id',
    'kode',
    'deskripsi',
    'deskripsi_lengkap',
    'klaster',
    'parent_id',
    'penyusutan_id',
    'retensi_aktif',
    'retensi_inaktif',
  ],
};

// Semantic ratio presets
export const SEMANTIC_RATIOS = {
  simple: 0,
  balanced: 0.3,
  semantic: 0.5,
  deep: 0.7,
};