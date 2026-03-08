import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { Product, Promo } from '../../lib/supabase';
import { formatPrice } from '../../lib/format';
import styles from '../../styles/AdminDashboard.module.css';

type ProductForm = {
  name: string; description: string; price: string; old_price: string; image_urls: string[];
};
const EMPTY_PRODUCT_FORM: ProductForm = { name: '', description: '', price: '', old_price: '', image_urls: ['','','','',''] };

const DEFAULT_PROMO: Promo = {
  id: 1,
  title: "Ko'proq mahsulotlar tez orada!",
  text: "Hozircha 10–15 ta mahsulot bilan tanishib chiqing. Yaqin kunlarda qolgan barcha mahsulotlarni huddi o'zingiz xohlaganidek — rasmlar va tavsiflar bilan — saytga qo'shamiz.",
  btn1_text: "Telegram kanalga obuna bo'ling",
  btn1_url: "https://t.me/Chocoanoww",
  btn2_text: "Qo'ng'iroq qiling",
  btn2_url: "tel:+998993413373",
  emoji1: "🍓", emoji2: "🍫", emoji3: "🍬", emoji4: "🎁",
  visible: true,
};

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<'products' | 'promo'>('products');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(EMPTY_PRODUCT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Promo state
  const [promo, setPromo] = useState<Promo>(DEFAULT_PROMO);
  const [promoLoading, setPromoLoading] = useState(true);
  const [promoSaving, setPromoSaving] = useState(false);
  const [promoSaved, setPromoSaved] = useState(false);

  const [error, setError] = useState('');

  const fileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  useEffect(() => {
    if (!token) { router.push('/admin'); return; }
    fetchProducts();
    fetchPromo();
  }, []);

  async function fetchProducts() {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch { setError('Mahsulotlarni yuklashda xato'); }
    finally { setLoadingProducts(false); }
  }

  async function fetchPromo() {
    setPromoLoading(true);
    try {
      const res = await fetch('/api/admin/promo', { headers: { 'x-admin-token': token || '' } });
      const data = await res.json();
      if (data.promo) setPromo(data.promo);
    } catch {}
    finally { setPromoLoading(false); }
  }

  async function savePromo(e: FormEvent) {
    e.preventDefault();
    setPromoSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/promo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token || '' },
        body: JSON.stringify(promo),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPromo(data.promo);
      setPromoSaved(true);
      setTimeout(() => setPromoSaved(false), 2500);
    } catch (err: any) { setError(err.message); }
    finally { setPromoSaving(false); }
  }

  function openAdd() { setEditProduct(null); setProductForm(EMPTY_PRODUCT_FORM); setError(''); setShowModal(true); }
  function openEdit(p: Product) {
    setEditProduct(p);
    setProductForm({ name: p.name, description: p.description || '', price: p.price ? String(p.price) : '', old_price: p.old_price ? String(p.old_price) : '',
      image_urls: [p.image_url||'', p.image_url_2||'', p.image_url_3||'', p.image_url_4||'', p.image_url_5||''] });
    setError(''); setShowModal(true);
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>, index: number) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIndex(index);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: { 'x-admin-token': token || '' }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const newUrls = [...productForm.image_urls];
      newUrls[index] = data.url;
      setProductForm(f => ({ ...f, image_urls: newUrls }));
    } catch (err: any) { setError('Rasm yuklashda xato: ' + err.message); }
    finally { setUploadingIndex(null); }
  }

  function removeImage(index: number) {
    const newUrls = [...productForm.image_urls]; newUrls[index] = '';
    setProductForm(f => ({ ...f, image_urls: newUrls }));
  }

  async function handleProductSubmit(e: FormEvent) {
    e.preventDefault(); setError('');
    if (!productForm.name.trim()) { setError('Mahsulot nomi kiritilishi shart'); return; }
    setSubmitting(true);
    const [u1,u2,u3,u4,u5] = productForm.image_urls;
    const body = { name: productForm.name.trim(), description: productForm.description.trim()||null,
      price: productForm.price ? Number(productForm.price) : null, old_price: productForm.old_price ? Number(productForm.old_price) : null,
      image_url: u1||null, image_url_2: u2||null, image_url_3: u3||null, image_url_4: u4||null, image_url_5: u5||null };
    try {
      const url = editProduct ? `/api/admin/products/${editProduct.id}` : '/api/admin/products';
      const res = await fetch(url, { method: editProduct ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': token||'' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowModal(false); fetchProducts();
    } catch (err: any) { setError(err.message||'Xato yuz berdi'); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', headers: { 'x-admin-token': token||'' } });
      if (!res.ok) throw new Error();
      setDeleteId(null); fetchProducts();
    } catch { setError("O'chirishda xato"); }
  }

  return (
    <>
      <Head><title>Admin Dashboard — Chocoa</title></Head>
      <div className={styles.page}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLogo}>
            <span>🍫</span><div><strong>Chocoa</strong><small>Admin Panel</small></div>
          </div>
          <nav className={styles.sidebarNav}>
            <button onClick={() => setTab('products')} className={tab === 'products' ? styles.navActive : ''}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              Mahsulotlar
            </button>
            <button onClick={() => setTab('promo')} className={tab === 'promo' ? styles.navActive : ''}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              E'lon (Post)
            </button>
            <a href="/" target="_blank">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
              </svg>
              Saytni ko'rish
            </a>
          </nav>
          <button onClick={() => { localStorage.removeItem('admin_token'); router.push('/admin'); }} className={styles.logoutBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>Chiqish
          </button>
        </aside>

        {/* MAIN */}
        <main className={styles.main}>
          {error && !showModal && (
            <div className={styles.errorBanner}>{error}<button onClick={() => setError('')}>✕</button></div>
          )}

          {/* ===== PRODUCTS TAB ===== */}
          {tab === 'products' && (
            <>
              <div className={styles.topBar}>
                <div><h1 className={styles.pageTitle}>Mahsulotlar</h1><p className={styles.pageSubtitle}>Jami: {products.length} ta</p></div>
                <button onClick={openAdd} className={styles.addBtn}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Yangi mahsulot
                </button>
              </div>
              {loadingProducts ? (
                <div className={styles.loadingWrap}><div className={styles.spinner}/><p>Yuklanmoqda...</p></div>
              ) : products.length === 0 ? (
                <div className={styles.emptyState}><span>🍬</span><p>Hozircha mahsulotlar yo'q</p><button onClick={openAdd} className={styles.addBtn}>Birinchi mahsulotni qo'shish</button></div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead><tr><th>Rasmlar</th><th>Nomi</th><th>Tavsif</th><th>Narx</th><th>Eski narx</th><th>Amallar</th></tr></thead>
                    <tbody>
                      {products.map((p) => {
                        const imgs = [p.image_url, p.image_url_2, p.image_url_3, p.image_url_4, p.image_url_5].filter(Boolean);
                        return (
                          <tr key={p.id}>
                            <td><div className={styles.thumbRow}>
                              {imgs.length > 0 ? imgs.map((img, i) => (
                                <div key={i} className={styles.thumbWrap}><Image src={img!} alt={p.name} fill className={styles.thumb} style={{ objectFit: 'cover' }} sizes="44px"/></div>
                              )) : <span className={styles.thumbEmpty}>🍫</span>}
                            </div></td>
                            <td className={styles.nameCell}>{p.name}</td>
                            <td className={styles.descCell}>{p.description||'—'}</td>
                            <td className={styles.priceCell}>{p.price ? formatPrice(p.price) : '—'}</td>
                            <td className={styles.oldPriceCell}>{p.old_price ? <s>{formatPrice(p.old_price)}</s> : '—'}</td>
                            <td><div className={styles.actions}>
                              <button onClick={() => openEdit(p)} className={styles.editBtn}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button onClick={() => setDeleteId(p.id)} className={styles.deleteBtn}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                              </button>
                            </div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ===== PROMO TAB ===== */}
          {tab === 'promo' && (
            <>
              <div className={styles.topBar}>
                <div><h1 className={styles.pageTitle}>E'lon (Post)</h1><p className={styles.pageSubtitle}>Saytdagi e'lon bo'limini tahrirlang</p></div>
              </div>
              {promoLoading ? (
                <div className={styles.loadingWrap}><div className={styles.spinner}/><p>Yuklanmoqda...</p></div>
              ) : (
                <form onSubmit={savePromo} className={styles.promoForm}>

                  {/* Ko'rinish toggle */}
                  <div className={styles.promoToggleRow}>
                    <span className={styles.promoToggleLabel}>E'lonni saytda ko'rsatish</span>
                    <label className={styles.toggle}>
                      <input type="checkbox" checked={promo.visible} onChange={e => setPromo(p => ({ ...p, visible: e.target.checked }))}/>
                      <span className={styles.toggleSlider}/>
                    </label>
                  </div>

                  <div className={styles.promoFields}>
                    <div className={styles.field}>
                      <label>Sarlavha</label>
                      <input type="text" value={promo.title} onChange={e => setPromo(p => ({ ...p, title: e.target.value }))} placeholder="E'lon sarlavhasi"/>
                    </div>
                    <div className={styles.field}>
                      <label>Matn</label>
                      <textarea rows={5} value={promo.text} onChange={e => setPromo(p => ({ ...p, text: e.target.value }))} placeholder="E'lon matni..."/>
                    </div>

                    <div className={styles.promoSectionTitle}>1-tugma (asosiy)</div>
                    <div className={styles.row2}>
                      <div className={styles.field}>
                        <label>Tugma matni</label>
                        <input type="text" value={promo.btn1_text} onChange={e => setPromo(p => ({ ...p, btn1_text: e.target.value }))} placeholder="Telegram kanalga obuna bo'ling"/>
                      </div>
                      <div className={styles.field}>
                        <label>Tugma havolasi (URL)</label>
                        <input type="text" value={promo.btn1_url} onChange={e => setPromo(p => ({ ...p, btn1_url: e.target.value }))} placeholder="https://t.me/..."/>
                      </div>
                    </div>

                    <div className={styles.promoSectionTitle}>2-tugma (ikkinchi)</div>
                    <div className={styles.row2}>
                      <div className={styles.field}>
                        <label>Tugma matni</label>
                        <input type="text" value={promo.btn2_text} onChange={e => setPromo(p => ({ ...p, btn2_text: e.target.value }))} placeholder="Qo'ng'iroq qiling"/>
                      </div>
                      <div className={styles.field}>
                        <label>Tugma havolasi (URL)</label>
                        <input type="text" value={promo.btn2_url} onChange={e => setPromo(p => ({ ...p, btn2_url: e.target.value }))} placeholder="tel:+998..."/>
                      </div>
                    </div>

                    <div className={styles.promoSectionTitle}>Emoji bezaklar (4 ta)</div>
                    <div className={styles.emojiRow}>
                      {(['emoji1','emoji2','emoji3','emoji4'] as const).map((key, i) => (
                        <div key={key} className={styles.field}>
                          <label>{i+1}-emoji</label>
                          <input type="text" value={promo[key]} onChange={e => setPromo(p => ({ ...p, [key]: e.target.value }))} placeholder="🍓" className={styles.emojiInput}/>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live preview */}
                  <div className={styles.promoPreviewLabel}>Ko'rinish (preview)</div>
                  <div className={styles.promoPreview}>
                    <div className={styles.previewLeft}>
                      <span className={styles.previewTag}>📢 E'lon</span>
                      <div className={styles.previewTitle}>{promo.title || 'Sarlavha...'}</div>
                      <div className={styles.previewText}>{promo.text || 'Matn...'}</div>
                      <div className={styles.previewBtns}>
                        {promo.btn1_text && <span className={styles.previewBtn1}>{promo.btn1_text}</span>}
                        {promo.btn2_text && <span className={styles.previewBtn2}>{promo.btn2_text}</span>}
                      </div>
                    </div>
                    <div className={styles.previewEmojis}>
                      {[promo.emoji1, promo.emoji2, promo.emoji3, promo.emoji4].map((em, i) => em && <span key={i}>{em}</span>)}
                    </div>
                  </div>

                  {error && <div className={styles.modalError}>{error}</div>}

                  <button type="submit" className={styles.promoSaveBtn} disabled={promoSaving}>
                    {promoSaving ? <span className={styles.spinnerWhite}/> : promoSaved ? '✓ Saqlandi!' : 'Saqlash'}
                  </button>
                </form>
              )}
            </>
          )}
        </main>
      </div>

      {/* PRODUCT MODAL */}
      {showModal && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editProduct ? 'Mahsulotni tahrirlash' : "Yangi mahsulot qo'shish"}</h2>
              <button onClick={() => setShowModal(false)} className={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleProductSubmit} className={styles.modalForm}>
              <div className={styles.imagesSection}>
                <label className={styles.imagesLabel}>Rasmlar (1 dan 5 tagacha, ixtiyoriy)</label>
                <div className={styles.imagesGrid}>
                  {[0,1,2,3,4].map((i) => (
                    <div key={i} className={styles.imgSlot}>
                      <div className={styles.imgPreview} onClick={() => fileRefs[i].current?.click()}>
                        {productForm.image_urls[i] ? (
                          <Image src={productForm.image_urls[i]} alt={`rasm ${i+1}`} fill style={{ objectFit: 'cover', borderRadius: '10px' }} sizes="90px"/>
                        ) : uploadingIndex === i ? (
                          <div className={styles.imgPlaceholder}><div className={styles.spinner}/></div>
                        ) : (
                          <div className={styles.imgPlaceholder}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <span>{i === 0 ? 'Asosiy' : `${i+1}-rasm`}</span>
                          </div>
                        )}
                        {productForm.image_urls[i] && (
                          <button type="button" className={styles.imgRemove} onClick={(e) => { e.stopPropagation(); removeImage(i); }}>✕</button>
                        )}
                      </div>
                      <input ref={fileRefs[i]} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, i)} style={{ display: 'none' }}/>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.fields}>
                <div className={styles.field}>
                  <label>Mahsulot nomi *</label>
                  <input type="text" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} placeholder="Masalan: Milk Chocolate Box" required/>
                </div>
                <div className={styles.field}>
                  <label>Tavsif</label>
                  <textarea value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} placeholder="Mahsulot haqida..." rows={3}/>
                </div>
                <div className={styles.row2}>
                  <div className={styles.field}><label>Narx (so'm)</label><input type="number" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} placeholder="150000" min="0"/></div>
                  <div className={styles.field}><label>Eski narx (ixtiyoriy)</label><input type="number" value={productForm.old_price} onChange={e => setProductForm(f => ({ ...f, old_price: e.target.value }))} placeholder="200000" min="0"/></div>
                </div>
              </div>
              {error && <div className={styles.modalError}>{error}</div>}
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>Bekor qilish</button>
                <button type="submit" className={styles.saveBtn} disabled={submitting}>
                  {submitting ? <span className={styles.spinnerWhite}/> : editProduct ? 'Saqlash' : "Qo'shish"}
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
