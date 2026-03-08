import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { Product } from '../../lib/supabase';
import { formatPrice } from '../../lib/format';
import styles from '../../styles/AdminDashboard.module.css';

type FormData = {
  name: string;
  description: string;
  price: string;
  old_price: string;
  image_url: string;
};

const EMPTY_FORM: FormData = {
  name: '',
  description: '',
  price: '',
  old_price: '',
  image_url: '',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setError("Mahsulotlarni yuklashda xato");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price ? String(p.price) : '',
      old_price: p.old_price ? String(p.old_price) : '',
      image_url: p.image_url || '',
    });
    setError('');
    setShowModal(true);
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-token': token || '' },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setForm(f => ({ ...f, image_url: data.url }));
    } catch (err: any) {
      setError('Rasm yuklashda xato: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError("Mahsulot nomi kiritilishi shart"); return; }
    setSubmitting(true);

    const body = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: form.price ? Number(form.price) : null,
      old_price: form.old_price ? Number(form.old_price) : null,
      image_url: form.image_url || null,
    };

    try {
      const url = editProduct ? `/api/admin/products/${editProduct.id}` : '/api/admin/products';
      const method = editProduct ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token || '',
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.message || 'Xato yuz berdi');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token || '' },
      });
      if (!res.ok) throw new Error();
      setDeleteId(null);
      fetchProducts();
    } catch {
      setError("O'chirishda xato");
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard — Chocoa</title>
      </Head>

      <div className={styles.page}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLogo}>
            <span>🍫</span>
            <div>
              <strong>Chocoa</strong>
              <small>Admin Panel</small>
            </div>
          </div>

          <nav className={styles.sidebarNav}>
            <a href="#" className={styles.navActive}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              Mahsulotlar
            </a>
            <a href="/" target="_blank">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
              </svg>
              Saytni ko'rish
            </a>
          </nav>

          <button onClick={handleLogout} className={styles.logoutBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Chiqish
          </button>
        </aside>

        {/* Main */}
        <main className={styles.main}>
          <div className={styles.topBar}>
            <div>
              <h1 className={styles.pageTitle}>Mahsulotlar</h1>
              <p className={styles.pageSubtitle}>Jami: {products.length} ta mahsulot</p>
            </div>
            <button onClick={openAdd} className={styles.addBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Yangi mahsulot
            </button>
          </div>

          {error && !showModal && (
            <div className={styles.errorBanner}>
              {error}
              <button onClick={() => setError('')}>✕</button>
            </div>
          )}

          {loading ? (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
              <p>Yuklanmoqda...</p>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>
              <span>🍬</span>
              <p>Hozircha mahsulotlar yo'q</p>
              <button onClick={openAdd} className={styles.addBtn}>Birinchi mahsulotni qo'shish</button>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Rasm</th>
                    <th>Nomi</th>
                    <th>Tavsif</th>
                    <th>Narx</th>
                    <th>Eski narx</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className={styles.thumbWrap}>
                          {p.image_url ? (
                            <Image
                              src={p.image_url}
                              alt={p.name}
                              fill
                              className={styles.thumb}
                              style={{ objectFit: 'cover' }}
                              sizes="56px"
                            />
                          ) : (
                            <span className={styles.thumbEmpty}>🍫</span>
                          )}
                        </div>
                      </td>
                      <td className={styles.nameCell}>{p.name}</td>
                      <td className={styles.descCell}>{p.description || '—'}</td>
                      <td className={styles.priceCell}>
                        {p.price ? formatPrice(p.price) : '—'}
                      </td>
                      <td className={styles.oldPriceCell}>
                        {p.old_price ? <s>{formatPrice(p.old_price)}</s> : '—'}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button onClick={() => openEdit(p)} className={styles.editBtn}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button onClick={() => setDeleteId(p.id)} className={styles.deleteBtn}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}</h2>
              <button onClick={() => setShowModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              {/* Image upload */}
              <div className={styles.imageUploadArea}>
                <div
                  className={styles.imagePreview}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {form.image_url ? (
                    <Image
                      src={form.image_url}
                      alt="preview"
                      fill
                      style={{ objectFit: 'cover', borderRadius: '12px' }}
                      sizes="200px"
                    />
                  ) : (
                    <div className={styles.imageUploadPlaceholder}>
                      {uploadingImage ? (
                        <div className={styles.spinner} />
                      ) : (
                        <>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                          <span>Rasm yuklash</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <div className={styles.imageActions}>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className={styles.uploadBtn}>
                    {uploadingImage ? 'Yuklanmoqda...' : 'Rasm tanlash'}
                  </button>
                  {form.image_url && (
                    <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))} className={styles.removeImgBtn}>
                      O'chirish
                    </button>
                  )}
                </div>
              </div>

              {/* Form fields */}
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label>Mahsulot nomi *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Masalan: Milk Chocolate Box"
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label>Tavsif</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Mahsulot haqida qisqacha ma'lumot..."
                    rows={3}
                  />
                </div>

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label>Narx (so'm)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="150000"
                      min="0"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Eski narx (ixtiyoriy)</label>
                    <input
                      type="number"
                      value={form.old_price}
                      onChange={e => setForm(f => ({ ...f, old_price: e.target.value }))}
                      placeholder="200000"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {error && <div className={styles.modalError}>{error}</div>}

              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>
                  Bekor qilish
                </button>
                <button type="submit" className={styles.saveBtn} disabled={submitting}>
                  {submitting ? <span className={styles.spinnerWhite} /> : (editProduct ? 'Saqlash' : 'Qo\'shish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className={styles.overlay}>
          <div className={styles.confirmModal}>
            <div className={styles.confirmIcon}>🗑️</div>
            <h3>Mahsulotni o'chirish</h3>
            <p>Bu mahsulot butunlay o'chiriladi. Davom etasizmi?</p>
            <div className={styles.confirmBtns}>
              <button onClick={() => setDeleteId(null)} className={styles.cancelBtn}>Yo'q</button>
              <button onClick={() => handleDelete(deleteId)} className={styles.dangerBtn}>Ha, o'chirish</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
