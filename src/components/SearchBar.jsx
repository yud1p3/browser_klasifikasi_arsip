import { useState } from 'react';

export function SearchBar({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = 'Cari kode klasifikasi...',
  isLoading = false,
  disabled = false,
}) {
  const [mode, setMode] = useState('simple');
  const [semanticRatio, setSemanticRatio] = useState(0.3);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value, { mode, semanticRatio });
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="search-input" className="sr-only">
          Pencarian klasifikasi
        </label>
        <div className="relative">
          <input
            id="search-input"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full rounded-xl border p-4 pl-12 pr-32
              shadow-sm transition-all
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
              ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white border-gray-300'}
            `}
          />
          {/* Search icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Clear button */}
          {value && !disabled && !isLoading && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-32 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Hapus pencarian"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {/* Mode toggle button */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={disabled}
            className={`
              absolute right-8 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all
              ${mode === 'advanced' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
            aria-pressed={mode === 'advanced'}
          >
            {mode === 'simple' ? 'Sederhana' : 'Lanjut'}
          </button>
          
          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </form>

      {/* Advanced Options */}
      {showAdvanced && (
        <div 
          className="overflow-hidden animate-slide-down"
          style={{ animationDuration: '200ms' }}
        >
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 space-y-3 animate-fade-in">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Mode Pencarian Semantik: <span className="font-mono text-blue-600">{Math.round(semanticRatio * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={semanticRatio}
                onChange={(e) => setSemanticRatio(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                aria-label="Tingkat pencarian semantik"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Keyword only (0%)</span>
                <span>Semantic only (100%)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {semanticRatio === 0 
                  ? 'Pencarian kata kunci exact match saja' 
                  : semanticRatio <= 0.3
                  ? 'Seimbang: kata kunci + konteks (recommended)'
                  : semanticRatio <= 0.6
                  ? 'Lebih menekankan makna/konteks'
                  : 'Hanya pencarian semantik (maksimal konteks)'}
              </p>
            </div>
            
            <div className="flex gap-2 pt-2 border-t border-blue-100">
              <button
                type="button"
                onClick={() => { setSemanticRatio(0); setMode('simple'); }}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keyword Only
              </button>
              <button
                type="button"
                onClick={() => { setSemanticRatio(0.3); setMode('advanced'); }}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Balanced (0.3)
              </button>
              <button
                type="button"
                onClick={() => { setSemanticRatio(0.7); setMode('advanced'); }}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Deep Semantic (0.7)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}