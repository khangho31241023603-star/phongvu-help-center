import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { PART_CATEGORIES, formatMoney } from '../../lib/constants';
import Loading, { EmptyState } from '../../components/Loading';
import { useToast } from '../../components/Toast';

const blank = { name: '', category: PART_CATEGORIES[0], price: '', stock: '' };

export default function AdminParts() {
  const toast = useToast();
  const [parts, setParts] = useState(null);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const load = () => api.listParts().then(setParts);
  useEffect(() => { load(); }, []);

  const list = useMemo(() => (parts || []).filter((p) =>
    (!cat || p.category === cat) && (!q.trim() || p.name.toLowerCase().includes(q.trim().toLowerCase()))), [parts, q, cat]);

  const startEdit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name, category: p.category, price: p.price, stock: p.stock });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancel = () => { setEditing(null); setForm(blank); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast('Vui lòng nhập tên linh kiện.', 'error');
    if (Number(form.price) < 0 || form.price === '') return toast('Giá không hợp lệ.', 'error');
    if (Number(form.stock) < 0 || form.stock === '') return toast('Tồn kho không hợp lệ.', 'error');
    await api.savePart({ ...(editing ? { id: editing } : {}), name: form.name.trim(), category: form.category, price: Number(form.price), stock: Number(form.stock) });
    toast(editing ? 'Đã cập nhật linh kiện' : 'Đã thêm linh kiện');
    cancel();
    load();
  };

  const remove = async (id) => {
    await api.deletePart(id);
    setConfirmId(null);
    toast('Đã xóa linh kiện');
    load();
  };

  return (
    <>
      <div className="page-head">
        <h1>Danh mục linh kiện</h1>
        <p className="muted">Kỹ thuật viên chọn linh kiện từ danh mục này khi lập báo giá.</p>
      </div>

      <form className="card part-form" onSubmit={submit}>
        <h3>{editing ? 'Sửa linh kiện' : 'Thêm linh kiện'}</h3>
        <div className="grid-4">
          <label className="field span-2">
            <span>Tên linh kiện</span>
            <input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="field">
            <span>Nhóm</span>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {PART_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Giá (VNĐ)</span>
            <input name="price" type="number" min="0" step="10000" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </label>
          <label className="field">
            <span>Tồn kho</span>
            <input name="stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </label>
        </div>
        <div className="row-actions">
          <button className="btn btn-primary">{editing ? 'Lưu thay đổi' : 'Thêm vào danh mục'}</button>
          {editing && <button type="button" className="btn btn-ghost" onClick={cancel}>Hủy</button>}
        </div>
      </form>

      <div className="card filters">
        <input className="grow" placeholder="Tìm tên linh kiện..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm linh kiện" />
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Lọc nhóm">
          <option value="">Mọi nhóm</option>
          {PART_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {!parts ? <Loading /> : list.length === 0 ? <EmptyState title="Không có linh kiện phù hợp" /> : (
        <div className="card table-card">
          <div className="table-wrap">
            <table className="table table-hover">
              <thead><tr><th>Tên linh kiện</th><th>Nhóm</th><th className="num">Giá</th><th className="num">Tồn kho</th><th /></tr></thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><span className="tag">{p.category}</span></td>
                    <td className="num">{formatMoney(p.price)}</td>
                    <td className={p.stock <= 3 ? 'num low-stock' : 'num'}>{p.category === 'Dịch vụ' ? '∞' : p.stock}</td>
                    <td className="row-actions end">
                      {confirmId === p.id ? (
                        <>
                          <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>Xác nhận xóa</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)}>Không</button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-ghost btn-sm" onClick={() => startEdit(p)}>Sửa</button>
                          <button className="btn btn-ghost btn-sm danger-text" onClick={() => setConfirmId(p.id)}>Xóa</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
