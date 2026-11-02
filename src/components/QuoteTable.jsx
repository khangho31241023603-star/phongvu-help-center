import { formatMoney } from '../lib/constants';

export const quoteTotal = (items = []) => items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0);

export default function QuoteTable({ items = [] }) {
  if (!items.length) return <p className="muted">Kỹ thuật viên chưa lập báo giá.</p>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr><th>Hạng mục</th><th className="num">SL</th><th className="num">Đơn giá</th><th className="num">Thành tiền</th></tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id || it.description}>
              <td>{it.description}</td>
              <td className="num">{it.quantity}</td>
              <td className="num">{formatMoney(it.unit_price)}</td>
              <td className="num">{formatMoney(it.quantity * it.unit_price)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td colSpan={3}>Tổng cộng</td><td className="num strong">{formatMoney(quoteTotal(items))}</td></tr>
        </tfoot>
      </table>
    </div>
  );
}
