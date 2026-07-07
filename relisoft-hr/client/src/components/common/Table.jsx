import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const Table = ({ columns, data, loading, onSort, searchTerm, onSearchChange }) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [localSearch, setLocalSearch] = useState('');

  const search = searchTerm !== undefined ? searchTerm : localSearch;
  const handleSearch = onSearchChange || setLocalSearch;

  const filteredData = useMemo(() => {
    if (!data || !search) return data || [];
    const lower = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        return val && String(val).toLowerCase().includes(lower);
      })
    );
  }, [data, search, columns]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir]);

  const handleSort = (key) => {
    const dir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(dir);
    if (onSort) onSort(key, dir);
  };

  const SortIcon = ({ column }) => {
    if (sortKey !== column) return <ArrowUpDown size={14} style={{ color: 'var(--muted)' }} />;
    return sortDir === 'asc' ? (
      <ArrowUp size={14} style={{ color: 'var(--moss)' }} />
    ) : (
      <ArrowDown size={14} style={{ color: 'var(--moss)' }} />
    );
  };

  return (
    <div className="table-container">
      <div className="p-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--paper)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`table-header ${col.sortable !== false ? 'cursor-pointer select-none' : ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && <SortIcon column={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="table-cell">
                      <div className="h-4 rounded animate-pulse w-3/4" style={{ background: 'var(--line)' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-cell text-center py-8" style={{ color: 'var(--muted)' }}>
                  No data found
                </td>
              </tr>
            ) : (
              sortedData.map((row, i) => (
                <tr key={row._id || row.id || i} className="table-row-hover">
                  {columns.map((col) => (
                    <td key={col.key} className="table-cell">
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
