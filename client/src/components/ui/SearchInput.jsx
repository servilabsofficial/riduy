import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SearchInput({ value, onChange, placeholder = 'Buscar...' }) {
  const [local, setLocal] = useState(value || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange?.(local);
    }, 300);
    return () => clearTimeout(timer);
  }, [local]);

  useEffect(() => {
    setLocal(value || '');
  }, [value]);

  return (
    <div className="relative">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 pr-8"
      />
      {local && (
        <button
          onClick={() => setLocal('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
