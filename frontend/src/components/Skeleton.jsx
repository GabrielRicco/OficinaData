import React from 'react';
import './Skeleton.css';

export function Skeleton({ width, height = '14px', radius = '6px', className = '' }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <table className="sys-table" aria-hidden="true">
      <thead>
        <tr>{Array.from({ length: cols }).map((_, i) => (
          <th key={i}><Skeleton width="80px" /></th>
        ))}</tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <td key={c}><Skeleton width={c === 0 ? '50px' : c === cols - 1 ? '70px' : '120px'} /></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 16 }}
      aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="sys-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Skeleton width="100px" height="11px" />
          <Skeleton width="80px" height="36px" radius="8px" />
        </div>
      ))}
    </div>
  );
}
