import Head from 'next/head';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import { supabase, Product } from '../lib/supabase';
import { formatPrice } from '../lib/format';
import styles from '../styles/Home.module.css';

type Props = { products: Product[] };

export default function Home({ products }: Props) {
  const [lightbox, setLightbox] = useState<{ product: Product; imgIndex: number } | null>(null);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!lightbox) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImg();
      if (e.key === 'ArrowLeft') prevImg();
    }
    document.addEventListener('keydown', onKey);
    if (lightbox) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [lightbox, closeLightbox]);

  function getImages(p: Product): string[] {
    return [p.image_url, p.image_url_2, p.image_url_3, p.image_url_4, p.image_url_5].filter(Boolean) as string[];
  }

  function nextImg() {
    if (!lightbox) return;
    const imgs = getImages(lightbox.product);
    setLightbox({ ...lightbox, imgIndex: (lightbox.imgIndex + 1) % imgs.length });
  }

  function prevImg() {
    if (!lightbox) return;
    const imgs = getImages(lightbox.product);
    setLightbox({ ...lightbox, imgIndex: (lightbox.imgIndex - 1 + imgs.length) % imgs.length });
  }

  return (
    <>
      <Head>
        <title>Chocoanow — Strawberry Chocolate</title>
        <meta name="description" content="Eng mazali klubnika va shirinliklar. Sinabog' 16 etajlik dom." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.page}>
        {/* HEADER */}
        <header className={styles.header}>
          <div className={`container ${styles.headerInner}`}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🍫</span>
              <div>
                <span className={styles.logoText}>Chocoa</span>
                <span className={styles.logoSub}>Shirinliklar Do'koni</span>
              </div>
            </div>
            <nav className={styles.nav}>
              <a href="#products">Mahsulotlar</a>
              <a href="#contact">Aloqa</a>
              <a href="https://t.me/Chocoanoww" target="_blank" rel="noopener noreferrer" className={styles.navTg}>Telegram</a>
            </nav>
          </div>
        </header>

        {/* HERO */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroContent}`}>
            <p className={styles.heroLabel}>Eng sifatli klubnikalar</p>
            <h1 className={styles.heroTitle}>Har bir lahza<br /><em>shirin bo'lsin</em></h1>
            <p className={styles.heroDesc}>Shahrisabzdagi eng mazali klubnika va shirinliklar do'koni. Har kuni yangi mahsulotlar.</p>
            <a href="#products" className={styles.heroBtn}>
              Mahsulotlarni ko'rish
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
            </a>
          </div>
          <div className={styles.heroDecor}><div className={styles.heroCircle1}/><div className={styles.heroCircle2}/></div>
        </section>

        {/* PRODUCTS */}
        <section id="products" className={styles.products}>
          <div className="container">
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Mahsulotlar Katalogi</h2>
              <p className={styles.sectionDesc}>Barcha mahsulotlar yuqori sifat nazoratidan o'tgan</p>
            </div>
            {products.length === 0 ? (
              <div className={styles.empty}><span>🍬</span><p>Hozircha mahsulotlar yo'q</p></div>
            ) : (
              <div className={styles.grid}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onImageClick={(p, i) => setLightbox({ product: p, imgIndex: i })} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* PROMO POST */}
        <section className={styles.promoSection}>
          <div className="container">
            <div className={styles.promoCard}>
              <div className={styles.promoLeft}>
                <span className={styles.promoTag}>📢 E'lon</span>
                <h2 className={styles.promoTitle}>Ko'proq mahsulotlar tez orada!</h2>
                <p className={styles.promoText}>
                  Hozircha 10–15 ta mahsulot bilan tanishib chiqing. Yaqin kunlarda qolgan barcha mahsulotlarni
                  huddi o'zingiz xohlaganidek — rasmlar va tavsiflar bilan — saytga qo'shamiz.
                  Yangilanishlarni kuzatib boring!
                </p>
                <div className={styles.promoBtns}>
                  <a href="https://t.me/Chocoanoww" target="_blank" rel="noopener noreferrer" className={styles.promoBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Telegram kanalga obuna bo'ling
                  </a>
                  <a href="tel:+998993413373" className={styles.promoBtnSecondary}>
                    Qo'ng'iroq qiling
                  </a>
                </div>
              </div>
              <div className={styles.promoRight}>
                <div className={styles.promoEmojis}>
                  <span>🍓</span><span>🍫</span><span>🍬</span><span>🎁</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className={styles.contact}>
          <div className="container">
            <div className={styles.contactGrid}>
              <div className={styles.contactInfo}>
                <h2 className={styles.contactTitle}>Biz bilan bog'laning</h2>
                <p className={styles.contactDesc}>Buyurtma bermoqchimisiz? Yoki savollaringiz bormi? Biz har doim aloqadamiz.</p>
                <div className={styles.contactItems}>
                  <a href="tel:+998993413373" className={styles.contactItem}>
                    <div className={styles.contactIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.12 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012.23 1.27h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.11a16 16 0 006 6l1.27-.56a2 2 0 012.11.45c.907.339 1.85.573 2.81.7A2 2 0 0121.23 18z"/>
                      </svg>
                    </div>
                    <div><span className={styles.contactLabel}>Telefon</span><span className={styles.contactValue}>+998 99 341 33 73</span></div>
                  </a>
                  <a href="https://t.me/Chocoanoww" target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
                    <div className={styles.contactIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </div>
                    <div><span className={styles.contactLabel}>Telegram Kanal</span><span className={styles.contactValue}>@Chocoanoww</span></div>
                  </a>
                  <div className={styles.contactItem}>
                    <div className={styles.contactIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <div><span className={styles.contactLabel}>Manzil</span><span className={styles.contactValue}>Sinabog' 16 etajlik dom<br/>(Oqshom ko'chasi 1)</span></div>
                  </div>
                </div>
              </div>
              <div className={styles.mapWrapper}>
                <iframe title="Do'kon joylashuvi" width="100%" height="100%" style={{ border: 0, borderRadius: '16px' }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=66.8202%2C39.0884%2C66.8323%2C39.0985&layer=mapnik&marker=39.09345365369711%2C66.82627899999999"/>
                <a href="https://www.google.com/maps?q=39.09345365369711,66.82627899999999" target="_blank" rel="noopener noreferrer" className={styles.mapLink}>Google Maps da ko'rish →</a>
              </div>
            </div>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className="container">
            <div className={styles.footerInner}>
              <span>© 2024 Chocoa. Barcha huquqlar himoyalangan.</span>
              <div className={styles.footerLinks}>
                <a href="tel:+998993413373">+998 99 341 33 73</a>
                <a href="https://t.me/Chocoanoww" target="_blank" rel="noopener noreferrer">Telegram</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* LIGHTBOX */}
      {lightbox && (() => {
        const imgs = getImages(lightbox.product);
        const cur = lightbox.imgIndex;
        return (
          <div className={styles.lightboxOverlay} onClick={closeLightbox}>
            <button className={styles.lightboxClose} onClick={closeLightbox} aria-label="Yopish">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.lightboxImageWrap}>
                <Image src={imgs[cur]} alt={lightbox.product.name} fill sizes="(max-width: 768px) 100vw, 80vw" style={{ objectFit: 'contain' }} priority/>
                {imgs.length > 1 && (
                  <>
                    <button className={styles.lbPrev} onClick={prevImg} aria-label="Oldingi">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <button className={styles.lbNext} onClick={nextImg} aria-label="Keyingi">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                    <div className={styles.lbDots}>
                      {imgs.map((_, i) => (
                        <button key={i} className={i === cur ? styles.lbDotActive : styles.lbDot}
                          onClick={() => setLightbox({ ...lightbox, imgIndex: i })}/>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className={styles.lightboxInfo}>
                <h3 className={styles.lightboxName}>{lightbox.product.name}</h3>
                {lightbox.product.description && <p className={styles.lightboxDesc}>{lightbox.product.description}</p>}
                <div className={styles.lightboxPrices}>
                  {lightbox.product.price && <span className={styles.lightboxPrice}>{formatPrice(lightbox.product.price)}</span>}
                  {lightbox.product.old_price && <span className={styles.lightboxOldPrice}>{formatPrice(lightbox.product.old_price)}</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

function ProductCard({ product, onImageClick }: { product: Product; onImageClick: (p: Product, i: number) => void }) {
  const hasDiscount = product.old_price && product.price && product.old_price > product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.price! / product.old_price!) * 100) : null;
  const imgs = [product.image_url, product.image_url_2, product.image_url_3, product.image_url_4, product.image_url_5].filter(Boolean) as string[];

  return (
    <div className={styles.card}>
      <div className={styles.cardImageWrapper} onClick={() => imgs.length && onImageClick(product, 0)} style={{ cursor: imgs.length ? 'zoom-in' : 'default' }}>
        {imgs.length > 0 ? (
          <Image src={imgs[0]} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className={styles.cardImage} style={{ objectFit: 'cover' }}/>
        ) : (
          <div className={styles.cardNoImage}><span>🍫</span></div>
        )}
        {discountPercent && <div className={styles.discountBadge}>-{discountPercent}%</div>}
        {imgs.length > 1 && <div className={styles.imgCount}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> {imgs.length}</div>}
        {imgs.length > 0 && <div className={styles.cardZoomHint}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></div>}
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardName}>{product.name}</h3>
        {product.description && <p className={styles.cardDesc}>{product.description}</p>}
        <div className={styles.cardPrices}>
          {product.price && <span className={styles.cardPrice}>{formatPrice(product.price)}</span>}
          {product.old_price && <span className={styles.cardOldPrice}>{formatPrice(product.old_price)}</span>}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const { data: products, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) { console.error('Products fetch error:', error); return { props: { products: [] } }; }
  return { props: { products: products || [] } };
};
