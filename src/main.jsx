import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Check, Heart, MapPin, Menu, MessageCircle, Minus, Phone, Plus, Search, ShieldCheck, ShoppingBag, Sparkles, Star, Truck, X } from 'lucide-react';
import { database } from './lib/database';
import { fetchProducts } from './lib/api';
import { AdminPanel } from './AdminPanel';
import './styles.css';
import './admin.css';
import './checkout.css';

const categories = ['सभी सामान', 'एल्युमिनियम', 'प्लम्बिंग', 'टूल्स', 'ग्लास', 'सैनिटरी'];

function App() {
  const [products] = useState(database.products());
  const [liveProducts, setLiveProducts] = useState(products);
  const [adminMode, setAdminMode] = useState(window.location.hash === '#admin');
  const [cart, setCart] = useState(database.cart());
  const [activeCategory, setActiveCategory] = useState('सभी सामान');
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [buyer, setBuyer] = useState({ name: '', phone: '', address: '', city: '', pincode: '' });
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('');

  useEffect(() => database.saveCart(cart), [cart]);
  useEffect(() => {
    const onHashChange = () => setAdminMode(window.location.hash === '#admin');
    window.addEventListener('hashchange', onHashChange);
    fetchProducts().then((items) => { if (items.length) setLiveProducts(items); }).catch(() => {});
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  if (adminMode) return <AdminPanel />;
  const filtered = liveProducts.filter((item) => (activeCategory === 'सभी सामान' || item.category === activeCategory) && `${item.name} ${item.english}`.toLowerCase().includes(query.toLowerCase()));
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = (product) => {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      return found ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }];
    });
    setNoticeType('success');
    setNotice('Added successfully');
    setTimeout(() => setNotice(''), 2200);
  };
  const updateQuantity = (id, change) => setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + change } : item).filter((item) => item.quantity > 0));
  const placeOrder = async (event) => {
    event.preventDefault();
    if (!cart.length) return;
    const result = await database.saveOrder({ buyer, items: cart, total, createdAt: new Date().toISOString(), status: 'नया ऑर्डर' });
    if (result.source === 'local') { setNoticeType('success'); setNotice('Order saved on this device.'); } else { setNoticeType('success'); setNotice('Order request sent successfully.'); }
    setCart([]); setCheckoutOpen(false); setCartOpen(false); setBuyer({ name: '', phone: '', address: '', city: '', pincode: '' }); setTimeout(() => { setNotice(''); setNoticeType(''); }, 3500);
  };

  return <div className="app">
    {notice && <div className={`toast ${noticeType}`} role="status"><Check size={18} />{notice}</div>}
    <div className="topbar"><div><MapPin size={14} /> मोहनपुर, रूपौली (पूर्णिया)</div><div className="toplinks"><span>सोम - शनि: 8AM - 8PM</span><a href="tel:9570238752"><Phone size={14} /> 9570238752</a></div></div>
    <header className="header"><a className="brand" href="#home"><span className="brand-mark">ॐ</span><span><strong>रामकृष्ण</strong><small>हार्डवेयर स्टोर</small></span></a><nav className={menuOpen ? 'nav open' : 'nav'}><a href="#home" onClick={() => setMenuOpen(false)}>होम</a><a href="#products" onClick={() => setMenuOpen(false)}>सामान</a><a href="#services" onClick={() => setMenuOpen(false)}>हमारी सेवाएं</a><a href="#about" onClick={() => setMenuOpen(false)}>हमारे बारे में</a><a href="#contact" onClick={() => setMenuOpen(false)}>संपर्क</a><a className="admin-nav-link" href="#admin" onClick={() => setMenuOpen(false)}>Admin Login</a></nav><div className="header-actions"><a className="call-button" href="tel:9570238752" aria-label="फोन करें" title="फोन करें"><Phone size={17} /><span>कॉल करें</span></a><a className="admin-header-link" href="#admin">Admin Login</a><button className="cart-button" onClick={() => setCartOpen(true)} aria-label="Open cart"><ShoppingBag size={20} /><b>{cartCount}</b></button><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div></header>

    <main>
      <section className="hero" id="home"><div className="hero-copy"><p className="eyebrow"><Sparkles size={15} /> पूर्णिया का भरोसेमंद स्टोर</p><h1>घर बनाने का <em>हर सामान</em><br />एक ही छत के नीचे</h1><p className="hero-text">क्वालिटी एल्युमिनियम, प्लम्बिंग और हार्डवेयर सामान — सही दाम, सही सलाह और आपके काम की सही चीज़।</p><div className="hero-buttons"><a className="primary-button" href="#products">सामान देखें <ArrowRight size={18} /></a><a className="text-button" href="https://wa.me/919570238752" target="_blank" rel="noreferrer"><MessageCircle size={19} /> WhatsApp पर पूछें</a></div><div className="hero-proof"><span><strong>15+</strong><small>सालों का अनुभव</small></span><span><strong>5000+</strong><small>खुश ग्राहक</small></span><span><strong>100%</strong><small>ओरिजिनल सामान</small></span></div></div><div className="hero-visual"><div className="visual-label">एल्युमिनियम गेट और निर्माण</div><img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=90" alt="Aluminium gate" /><div className="floating-card"><ShieldCheck size={21} /><span><b>भरोसे का नाम</b><small>सही माल, सही रेट</small></span></div></div></section>
      <section className="trust-row"><div><Truck size={25} /><span><b>लोकल डिलीवरी</b><small>समय पर आपके घर तक</small></span></div><div><ShieldCheck size={25} /><span><b>पक्का बिल</b><small>पूरी पारदर्शिता के साथ</small></span></div><div><Star size={25} /><span><b>बेस्ट क्वालिटी</b><small>चुने हुए ब्रांड्स</small></span></div><div><MessageCircle size={25} /><span><b>एक्सपर्ट सलाह</b><small>काम के हिसाब से सुझाव</small></span></div></section>
      <section className="products-section" id="products"><div className="section-heading"><div><p className="eyebrow">हमारे स्टोर से</p><h2>हर काम का <span>सही सामान</span></h2></div><p className="section-note">आपके घर, दुकान या प्रोजेक्ट के लिए भरोसेमंद प्रोडक्ट्स।</p></div><div className="catalog-toolbar"><div className="categories">{categories.map((category) => <button className={activeCategory === category ? 'active' : ''} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><label className="search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="सामान खोजें..." /></label></div><div className="product-grid">{filtered.map((product) => <article className="product-card" key={product.id}><div className="product-image"><img src={product.image} alt={product.english} /><button className="heart" aria-label="Add to wishlist"><Heart size={18} /></button>{product.featured && <span className="badge">लोकप्रिय</span>}</div><div className="product-info"><small>{product.category}</small><h3>{product.name}</h3><p>{product.english}</p><div className="product-bottom"><div><strong>₹{product.price.toLocaleString('en-IN')}</strong><small>{product.unit}</small></div><button className="add-button" onClick={() => addToCart(product)}><Plus size={17} /> जोड़ें</button></div></div></article>)}</div>{!filtered.length && <div className="empty">इस कैटेगरी में सामान नहीं मिला।</div>}</section>
      <section className="services" id="services"><div className="services-copy"><p className="eyebrow">सिर्फ सामान नहीं</p><h2>आपके काम की <span>पूरी समझ</span></h2><p>सही नाप, सही फिटिंग और सही क्वालिटी — हमारे कारीगरों और टीम से काम शुरू करने से पहले साफ सलाह पाएं।</p><a className="primary-button" href="tel:9570238752">सलाह के लिए कॉल करें <Phone size={17} /></a></div><div className="service-list"><div><span>01</span><b>नाप और अनुमान</b><p>आपके प्रोजेक्ट के हिसाब से सही quantity और budget.</p></div><div><span>02</span><b>सामान की होम डिलीवरी</b><p>रूपौली और आसपास के क्षेत्रों में लोकल delivery.</p></div><div><span>03</span><b>एल्युमिनियम एवं ग्लास वर्क</b><p>गेट, विंडो और ग्लास fitting का भरोसेमंद काम.</p></div></div></section>
      <section className="about" id="about"><div className="about-image"><img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1000&q=85" alt="Hardware professional at work" /><span>2009 से आपकी सेवा में</span></div><div className="about-copy"><p className="eyebrow">क्यों रामकृष्ण?</p><h2>सामान बेचते नहीं,<br /><span>भरोसा बनाते हैं।</span></h2><p>हमारा लक्ष्य है कि आपके construction और repair का हर काम आसान, तेज़ और बेहतर हो। इसलिए हम सिर्फ वही सामान रखते हैं जिसे खुद अपने काम में इस्तेमाल करने पर भरोसा हो।</p><div className="check-list"><span><Check size={16} /> ब्रांडेड और टिकाऊ प्रोडक्ट्स</span><span><Check size={16} /> साफ रेट और पक्का बिल</span><span><Check size={16} /> स्थानीय, भरोसेमंद सर्विस</span></div></div></section>
      <section className="contact-band" id="contact"><div><p className="eyebrow">आज ही बात करें</p><h2>आपका अगला काम,<br /><span>हमारी जिम्मेदारी।</span></h2></div><div className="contact-actions"><a className="primary-button" href="tel:9570238752"><Phone size={19} /> 9570238752</a><a className="outline-button" href="https://wa.me/919570238752" target="_blank" rel="noreferrer"><MessageCircle size={19} /> WhatsApp</a></div></section>
    </main>
    <footer><div className="footer-main"><div className="footer-brand"><a className="brand" href="#home"><span className="brand-mark">ॐ</span><span><strong>रामकृष्ण</strong><small>हार्डवेयर स्टोर</small></span></a><p>आपके घर और हर निर्माण काम का भरोसेमंद साथी।</p></div><div><h4>जल्दी जाएं</h4><a href="#products">सारे प्रोडक्ट्स</a><a href="#services">हमारी सेवाएं</a><a href="#about">हमारे बारे में</a></div><div><h4>कैटेगरी</h4><a href="#products">एल्युमिनियम गेट</a><a href="#products">प्लम्बिंग सामान</a><a href="#products">स्लाइडर विंडो</a></div><div><h4>स्टोर पता</h4><p><MapPin size={15} /> विवेक चौक, मोहनपुर,<br />रूपौली, पूर्णिया (बिहार)</p><a className="footer-phone" href="tel:9570238752" aria-label="फोन करें" title="फोन करें"><Phone size={17} /></a></div></div><div className="footer-bottom"><span>© 2026 रामकृष्ण हार्डवेयर स्टोर</span><span>श्री गणेशाय नमः</span></div></footer>
    {cartOpen && <div className="drawer-backdrop" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={(e) => e.stopPropagation()}><div className="drawer-head"><div><small>आपका चयन</small><h2>शॉपिंग बैग <span>({cartCount})</span></h2></div><button onClick={() => setCartOpen(false)} aria-label="Close cart"><X /></button></div>{cart.length ? <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.image} alt="" /><div><b>{item.name}</b><small>₹{item.price.toLocaleString('en-IN')} / {item.unit}</small><div className="quantity"><button onClick={() => updateQuantity(item.id, -1)}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)}><Plus size={13} /></button></div></div></div>)}</div><div className="cart-total"><span>कुल अनुमानित राशि</span><strong>₹{total.toLocaleString('en-IN')}</strong></div><button className="primary-button checkout" onClick={() => setCheckoutOpen(true)}>ऑर्डर रिक्वेस्ट भेजें <ArrowRight size={17} /></button><p className="drawer-note">अगले चरण में delivery details भरें।</p></> : <div className="empty-cart"><ShoppingBag size={42} /><h3>आपका बैग खाली है</h3><p>पसंद का सामान जोड़ने के लिए नीचे जाएं।</p><button className="primary-button" onClick={() => setCartOpen(false)}>सामान देखें</button></div>}</aside></div>}
    {checkoutOpen && <div className="checkout-backdrop" onClick={() => setCheckoutOpen(false)}><form className="checkout-modal" onClick={(event) => event.stopPropagation()} onSubmit={placeOrder}><div className="drawer-head"><div><small>डिलीवरी जानकारी</small><h2>ऑर्डर पूरा करें</h2></div><button type="button" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout"><X /></button></div><p className="checkout-intro">आपका order confirm करने के लिए ये details भरें।</p><label>पूरा नाम<input value={buyer.name} onChange={(event) => setBuyer({ ...buyer, name: event.target.value })} placeholder="आपका नाम" required /></label><label>मोबाइल नंबर<input type="tel" pattern="[0-9]{10}" value={buyer.phone} onChange={(event) => setBuyer({ ...buyer, phone: event.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10 अंकों का मोबाइल नंबर" required /></label><label>पूरा पता<textarea value={buyer.address} onChange={(event) => setBuyer({ ...buyer, address: event.target.value })} placeholder="घर नंबर, मोहल्ला, landmark" rows="3" required /></label><div className="checkout-row"><label>शहर/गांव<input value={buyer.city} onChange={(event) => setBuyer({ ...buyer, city: event.target.value })} placeholder="रूपौली" required /></label><label>पिनकोड<input inputMode="numeric" pattern="[0-9]{6}" value={buyer.pincode} onChange={(event) => setBuyer({ ...buyer, pincode: event.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="854204" required /></label></div><div className="checkout-summary"><span>{cartCount} items का अनुमानित total</span><strong>₹{total.toLocaleString('en-IN')}</strong></div><button className="primary-button checkout" type="submit">ऑर्डर भेजें <ArrowRight size={17} /></button></form></div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
