export default function Loading({ full, text = 'Đang tải dữ liệu...' }) {
  return (
    <div className={full ? 'loading loading-full' : 'loading'}>
      <span className="spinner" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M2 20h20M9 8h6M9 11h4" />
        </svg>
      </div>
      <p className="empty-title">{title}</p>
      {children && <div className="empty-body">{children}</div>}
    </div>
  );
}
