import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, total, limit, onPage }) {
  if (pages <= 1) return null;
  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  const getPages = () => {
    const arr = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - page) <= 1) arr.push(i);
      else if (arr[arr.length - 1] !== '...') arr.push('...');
    }
    return arr;
  };

  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing {start}–{end} of {total}
      </span>
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft size={14} />
        </button>
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="pagination-btn" style={{ cursor: 'default' }}>…</span>
          ) : (
            <button
              key={p}
              className={`pagination-btn${p === page ? ' active' : ''}`}
              onClick={() => onPage(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          className="pagination-btn"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
