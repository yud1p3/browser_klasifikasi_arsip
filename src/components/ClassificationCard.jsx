import { useState, useRef, useEffect } from 'react';
import { getPenyusutanLabel } from '../utils/constants';

export function ClassificationCard({ 
  hit, 
  onIndukClick, 
  onSubKlasClick, 
  isSelected = false,
  onSelectToggle,
  hasChildren = false,
  level = 1,
}) {
  const [isDetailOpen, setIsDetailOpen] = useState(isSelected);
  const detailRef = useRef(null);

  // Sync with parent selection
  useEffect(() => {
    setIsDetailOpen(isSelected);
  }, [isSelected]);

  const handleDetailToggle = () => {
    const newState = !isDetailOpen;
    setIsDetailOpen(newState);
    onSelectToggle?.(hit.id, newState);
  };

  const handleIndukClick = (e) => {
    e.stopPropagation();
    onIndukClick?.(hit);
  };

  const handleSubKlasClick = (e) => {
    e.stopPropagation();
    onSubKlasClick?.(hit);
  };

  const handleCardClick = (e) => {
    // Don't toggle if clicking buttons
    if (e.target.closest('button')) return;
    handleDetailToggle();
  };

  // Format retensi display
  const formatRetensi = (aktif, inaktif) => {
    const parts = [];
    if (aktif !== undefined && aktif !== null && aktif !== '') {
      parts.push(`Aktif: ${aktif} tahun`);
    }
    if (inaktif !== undefined && inaktif !== null && inaktif !== '') {
      parts.push(`Inaktif: ${inaktif} tahun`);
    }
    return parts.length > 0 ? parts.join(' | ') : '-';
  };

  const penyusutanLabel = getPenyusutanLabel(hit.penyusutan_id);

  return (
    <div
      ref={detailRef}
      className={`group rounded-xl border shadow-sm transition-all cursor-pointer ${
        isDetailOpen 
          ? 'border-blue-500 shadow-md bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
      }`}
      onClick={handleCardClick}
      style={{ animationDelay: `${level * 50}ms` }}
    >
      {/* Main Card Content */}
      <div className="flex flex-col md:flex-row gap-3 p-5">
        {/* Kode Badge */}
        <div className="inline-flex w-auto shrink-0 items-center justify-center rounded-lg px-3 py-1 font-mono text-sm font-bold"
          style={{ 
            backgroundColor: level === 1 ? '#dbeafe' : level === 2 ? '#e0e7ff' : level === 3 ? '#fce7f3' : '#fef3c7',
            color: level === 1 ? '#1e40af' : level === 2 ? '#3730a3' : level === 3 ? '#9d174d' : '#92400e'
          }}
        >
          {hit.kode}
        </div>
        
        {/* Deskripsi & Actions */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 pr-4">
            {hit.deskripsi}
          </h3>
          
          {/* Action Buttons */}
          <div className="mt-3 flex flex-wrap gap-2">
            {/* Induk Button */}
            {hit.parent_id && hit.parent_id !== '0' && (
              <button
                onClick={handleIndukClick}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 hover:text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
                title="Kembali ke induk"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Induk
              </button>
            )}
            
            {/* Detail Button */}
            <button
              onClick={handleDetailToggle}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all focus:outline-none focus:ring-2 ${
                isDetailOpen
                  ? 'text-blue-700 bg-blue-100 border border-blue-200 focus:ring-blue-200'
                  : 'text-gray-600 bg-gray-100 border border-gray-200 hover:bg-gray-200 hover:text-gray-900 focus:ring-gray-200'
              }`}
              aria-expanded={isDetailOpen}
              aria-controls={`detail-${hit.id}`}
            >
              <svg className="w-3.5 h-3.5 transition-transform duration-200" 
                style={{ transform: isDetailOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {isDetailOpen ? 'Tutup Detail ▲' : 'Detail ▼'}
            </button>
            
            {/* Sub Klasifikasi Button */}
            {hasChildren && (
              <button
                onClick={handleSubKlasClick}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 hover:border-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
                title="Lihat sub-klasifikasi"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Sub Klas
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Detail Panel */}
      {isDetailOpen && (
        <div
          id={`detail-${hit.id}`}
          className="px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-2"
          role="region"
          aria-label={`Detail ${hit.kode}`}
        >
          <div className="border-t border-gray-200 pt-4 mt-2">
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
              Informasi Lengkap
            </h4>
            
            {/* Deskripsi Lengkap */}
            {hit.deskripsi_lengkap && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Deskripsi Lengkap</p>
                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {hit.deskripsi_lengkap}
                </p>
              </div>
            )}
            
            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Klaster */}
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Level (Klaster)</p>
                <p className="text-gray-900 font-mono text-sm">{hit.klaster}</p>
              </div>
              
              {/* Parent ID */}
              {hit.parent_id && (
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Parent ID</p>
                  <p className="text-gray-900 font-mono text-sm">{hit.parent_id}</p>
                </div>
              )}
              
              {/* Penyusutan */}
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Penyusutan</p>
                <p className="text-gray-900 font-medium">
                  {penyusutanLabel}
                  <span className="text-gray-400 font-normal ml-1">({hit.penyusutan_id})</span>
                </p>
              </div>
              
              {/* Retensi Aktif */}
              {hit.retensi_aktif !== undefined && hit.retensi_aktif !== null && hit.retensi_aktif !== '' && (
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Retensi Aktif</p>
                  <p className="text-gray-900 font-mono text-sm">{hit.retensi_aktif} tahun</p>
                </div>
              )}
              
              {/* Retensi Inaktif */}
              {hit.retensi_inaktif !== undefined && hit.retensi_inaktif !== null && hit.retensi_inaktif !== '' && (
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Retensi Inaktif</p>
                  <p className="text-gray-900 font-mono text-sm">{hit.retensi_inaktif} tahun</p>
                </div>
              )}
              
              {/* ID */}
              <div className="bg-white p-3 rounded-lg border border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">ID Dokumen</p>
                <p className="text-gray-900 font-mono text-xs">{hit.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}