export function EmptyState({ 
  icon, 
  title = 'Tidak ada data', 
  description = '', 
  action, 
  className = '' 
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-gray-300">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-4 max-w-md">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function NoResultsState({ query, onClear }) {
  return (
    <EmptyState
      title="Tidak ditemukan hasil"
      description={`Pencarian untuk "${query}" tidak mengembalikan hasil apapun. Coba perbaiki kata kunci atau gunakan mode pencarian lanjut.`}
      action={onClear ? { label: 'Hapus Pencarian', onClick: onClear } : null}
      icon={
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
    />
  );
}

export function InitialState({ onNavigateRoot }) {
  return (
    <EmptyState
      title="Selamat Datang di Browser Klasifikasi Arsip"
      description="Mulai dengan menelusuri klasifikasi induk, atau gunakan pencarian untuk menemukan klasifikasi spesifik."
      action={onNavigateRoot ? { label: 'Lihat Klasifikasi Induk', onClick: onNavigateRoot } : null}
      icon={
        <svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      }
    />
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <EmptyState
      title="Terjadi Kesalahan"
      description={message || 'Gagal memuat data. Silakan coba lagi.'}
      action={onRetry ? { label: 'Coba Lagi', onClick: onRetry } : null}
      icon={
        <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      }
    />
  );
}