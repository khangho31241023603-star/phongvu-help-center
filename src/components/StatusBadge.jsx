import { STATUS_MAP } from '../lib/constants';

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, tone: 'gray' };
  return <span className={`badge badge-${s.tone}`}>{s.label}</span>;
}
