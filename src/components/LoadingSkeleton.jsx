export function LoadingSkeleton({ count = 5 }) {
  return (
    <div className="grid gap-3" role="status" aria-label="Memuat data klasifikasi">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white shadow-sm animate-pulse">
          <div className="flex flex-col md:flex-row gap-3 p-5">
            <div className="inline-flex w-auto shrink-0 items-center justify-center rounded-lg bg-gray-200 px-3 py-1">
              <div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="px-5 pb-5 pt-0 border-t border-gray-100">
            <div className="space-y-3 pt-4">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };
  
  return (
    <div className={`flex justify-center items-center ${className}`} role="status" aria-label="Memuat...">
      <div className={`${sizes[size]} border-blue-500 border-t-transparent rounded-full animate-spin`} />
      <span className="sr-only">Memuat...</span>
    </div>
  );
}

export function LoadingOverlay({ message = 'Memuat data...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="text-center space-y-4 p-6 rounded-xl bg-white shadow-xl border border-gray-100">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}