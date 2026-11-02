import { PROGRESS_STEPS, STATUS_MAP, formatDateTime } from '../lib/constants';

// Thanh tiến độ ngang + lịch sử cập nhật dạng timeline
export default function ProgressTracker({ status, logs = [] }) {
  const effective = status === 'cho_linh_kien' ? 'dang_sua' : status;
  const current = PROGRESS_STEPS.indexOf(effective);
  const cancelled = status === 'da_huy';

  return (
    <div className="progress">
      {cancelled ? (
        <div className="alert alert-error">Lịch hẹn này đã bị hủy.</div>
      ) : (
        <ol className="steps">
          {PROGRESS_STEPS.map((key, i) => (
            <li key={key} className={i < current ? 'done' : i === current ? 'active' : ''}>
              <span className="step-dot">{i < current ? '✓' : i + 1}</span>
              <span className="step-label">
                {STATUS_MAP[key].label}
                {key === 'dang_sua' && status === 'cho_linh_kien' && <em> (đang chờ linh kiện)</em>}
              </span>
            </li>
          ))}
        </ol>
      )}

      {logs.length > 0 && (
        <div className="timeline">
          <h4>Lịch sử cập nhật</h4>
          <ul>
            {[...logs].reverse().map((l) => (
              <li key={l.id}>
                <span className="tl-time">{formatDateTime(l.created_at)}</span>
                <span className="tl-status">{STATUS_MAP[l.status]?.label || l.status}</span>
                {l.note && <span className="tl-note">{l.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
