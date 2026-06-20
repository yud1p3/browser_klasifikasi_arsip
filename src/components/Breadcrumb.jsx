export function Breadcrumb({ items, onItemClick, className = '' }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className={`mb-4 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-gray-500">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-1.5"
          >
            {index > 0 && (
              <span className="text-gray-300 animate-fade-in">
                /
              </span>
            )}
            <button
              onClick={() => onItemClick(item, index)}
              disabled={item.disabled}
              className={`
                px-2 py-1 rounded transition-colors
                font-medium whitespace-nowrap
                ${item.disabled
                  ? 'text-gray-900 font-bold cursor-default'
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200'
                }
                ${index === items.length - 1 && !item.disabled
                  ? 'text-blue-700 font-bold bg-blue-50'
                  : ''
                }
              `}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}