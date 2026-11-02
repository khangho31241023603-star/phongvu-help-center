import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { formatMoney } from '../lib/constants';
import { quoteTotal } from './QuoteTable';
import { useToast } from './Toast';

const EMPTY = [];

// KTV/Admin lập báo giá: chọn linh kiện từ danh mục hoặc thêm dòng công sửa tự nhập
export default function QuoteEditor({ bookingId, initial = EMPTY, readOnly, onSaved }) {
  const toast = useToast();
  const [parts, setParts] = useState([]);
  const [items, setItems] = useState(initial);
  const [pick, setPick] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { api.listParts().then(setParts); }, []);
  useEffect(() => { setItems(initial); setDirty(false); }, [initial]);

  const update = (next) => { setItems(next); setDirty(true); };

  const addPart = () => {
    const p = parts.find((x) => x.id === pick);
    if (!p) return;
    const existing = items.findIndex((i) => i.part_id === p.id);
    if (existing >= 0) {
      update(items.map((i, idx) => (idx === existing ? { ...i, quantity: Number(i.quantity) + 1 } : i)));
    } else {
      update([...items, { key: Date.now(), part_id: p.id, description: p.name, quantity: 1, unit_price: p.price }]);
    }
    setPick('');
  };

  const addLabor = () => update([...items, { key: Date.now(), part_id: null, description: 'Công sửa chữa', quantity: 1, unit_price: 150000 }]);

  const change = (idx, k, v) => update(items.map((i, n) => (n === idx ? { ...i, [k]: v } : i)));
  const remove = (idx) => update(items.filter((_, n) => n !== idx));

  const save = async () => {
    const clean = items.filter((i) => i.description.trim());
    if (clean.some((i) => Number(i.quantity) < 1 || Number(i.unit_price) < 0)) {
      toast('Số lượng phải từ 1 và đơn giá không âm.', 'error');
      return;
    }
    setSaving(true);
    try {
      const saved = await api.saveQuote(bookingId, clean);
      toast('Đã lưu báo giá');
      setDirty(false);
      onSaved?.(saved);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const stockOf = (partId) => parts.find((p) => p.id === partId)?.stock;

  return (
    <div className="quote-editor">
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Hạng mục</th><th className="num w-sm">SL</th><th className="num w-md">Đơn giá</th><th className="num">Thành tiền</th>{!readOnly && <th />}</tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={5} className="muted center">Chưa có hạng mục nào.</td></tr>
            )}
            {items.map((it, idx) => (
              <tr key={it.id || it.key || idx}>
                <td>
                  {readOnly || it.part_id ? it.description : (
                    <input className="input-sm" value={it.description} onChange={(e) => change(idx, 'description', e.target.value)} aria-label="Tên hạng mục" />
                  )}
                  {it.part_id && stockOf(it.part_id) !== undefined && stockOf(it.part_id) < Number(it.quantity) && (
                    <small className="error-text block">Tồn kho chỉ còn {stockOf(it.part_id)}</small>
                  )}
                </td>
                <td className="num">
                  {readOnly ? it.quantity : <input className="input-sm num" type="number" min="1" value={it.quantity} onChange={(e) => change(idx, 'quantity', e.target.value)} aria-label="Số lượng" />}
                </td>
                <td className="num">
                  {readOnly ? formatMoney(it.unit_price) : <input className="input-sm num" type="number" min="0" step="10000" value={it.unit_price} onChange={(e) => change(idx, 'unit_price', e.target.value)} aria-label="Đơn giá" />}
                </td>
                <td className="num">{formatMoney((Number(it.quantity) || 0) * (Number(it.unit_price) || 0))}</td>
                {!readOnly && <td><button type="button" className="icon-btn" onClick={() => remove(idx)} aria-label="Xóa dòng">×</button></td>}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={3}>Tổng cộng</td><td className="num strong">{formatMoney(quoteTotal(items))}</td>{!readOnly && <td />}</tr>
          </tfoot>
        </table>
      </div>

      {!readOnly && (
        <div className="quote-actions">
          <select value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Chọn linh kiện">
            <option value="">Chọn linh kiện từ danh mục</option>
            {parts.map((p) => <option key={p.id} value={p.id}>{p.category} · {p.name} · {formatMoney(p.price)}</option>)}
          </select>
          <button type="button" className="btn btn-outline btn-sm" onClick={addPart} disabled={!pick}>Thêm linh kiện</button>
          <button type="button" className="btn btn-outline btn-sm" onClick={addLabor}>Thêm công sửa</button>
          <button type="button" className="btn btn-primary btn-sm push-right" onClick={save} disabled={saving || !dirty}>
            {saving ? 'Đang lưu...' : 'Lưu báo giá'}
          </button>
        </div>
      )}
    </div>
  );
}
