import React, { useEffect, useState } from 'react';
import { ArrowLeft, Image, LogOut, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { apiRequest } from './lib/api';
import './admin.css';
import './admin-orders.css';

const emptyProduct = { name: '', english: '', category: 'प्लम्बिंग', price: '', unit: 'प्रति पीस', image: '', featured: false };
const categories = ['एल्युमिनियम', 'प्लम्बिंग', 'टूल्स', 'ग्लास', 'सैनिटरी'];

export function AdminPanel() {
  const [token, setToken] = useState(() => localStorage.getItem('rk_admin_token') || '');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadProducts = async () => {
    try { setProducts(await apiRequest('/products')); } catch (loadError) { setError(loadError.message); }
  };
  const loadOrders = async () => {
    try { setOrders(await apiRequest('/orders', { headers: { Authorization: `Bearer ${token}` } })); } catch (loadError) { setError(loadError.message); }
  };

  useEffect(() => { if (token) { loadProducts(); loadOrders(); } }, [token]);

  const login = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = await apiRequest('/admin/login', { method: 'POST', body: JSON.stringify(credentials) });
      localStorage.setItem('rk_admin_token', result.token); setToken(result.token);
    } catch (loginError) { setError(loginError.message); } finally { setBusy(false); }
  };

  const logout = () => { localStorage.removeItem('rk_admin_token'); setToken(''); setProducts([]); };
  const change = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };
  const resetForm = () => { setForm(emptyProduct); setEditingId(''); setImageFileName(''); };
  const editProduct = (product) => {
    setForm({ ...product, price: String(product.price) }); setImageFileName(''); setEditingId(product._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const chooseImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('कृपया सिर्फ image file चुनें।'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image 5MB से छोटी होनी चाहिए।'); return; }
    const reader = new FileReader();
    reader.onload = () => { setForm((current) => ({ ...current, image: reader.result })); setImageFileName(file.name); setError(''); };
    reader.readAsDataURL(file);
  };

  const saveProduct = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const path = editingId ? `/products/${editingId}` : '/products';
      const saved = await apiRequest(path, { method: editingId ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, price: Number(form.price) }) });
      setProducts((current) => editingId ? current.map((product) => product._id === saved._id ? saved : product) : [saved, ...current]);
      setMessage(editingId ? 'Product updated.' : 'Product added.'); resetForm();
    } catch (saveError) { setError(saveError.message); } finally { setBusy(false); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('इस product को delete करना है?')) return;
    try {
      await apiRequest(`/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setProducts((current) => current.filter((product) => product._id !== id)); setMessage('Product deleted.');
    } catch (deleteError) { setError(deleteError.message); }
  };

  if (!token) return <div className="admin-shell admin-login"><a className="admin-back" href="#home"><ArrowLeft size={16} /> Store पर वापस जाएं</a><form className="admin-login-card" onSubmit={login} autoComplete="off"><div className="admin-kicker">RAMKRISHNA HARDWARE</div><h1>Admin Login</h1><p>Products और store catalog manage करें।</p>{error && <div className="admin-error">{error}</div>}<label>User ID<input name="admin-user-id" placeholder="User ID" value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} autoComplete="off" required /></label><label>Password<input name="admin-password" type="password" placeholder="Password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} autoComplete="new-password" required /></label><button className="admin-primary" disabled={busy}>{busy ? 'Checking...' : 'Login'} <ArrowLeft size={16} className="admin-login-arrow" /></button></form></div>;

  return <div className="admin-shell"><header className="admin-header"><div><div className="admin-kicker">RAMKRISHNA HARDWARE</div><h1>Store Admin</h1></div><div className="admin-header-actions"><a href="#home"><ArrowLeft size={16} /> Store</a><button onClick={logout}><LogOut size={16} /> Logout</button></div></header><main className="admin-content"><section className="admin-form-card"><div className="admin-section-heading"><div><span>{editingId ? 'EDIT PRODUCT' : 'NEW PRODUCT'}</span><h2>{editingId ? 'Product update करें' : 'नया product जोड़ें'}</h2></div>{editingId && <button className="admin-icon-button" onClick={resetForm} aria-label="Cancel edit"><X size={18} /></button>}</div>{error && <div className="admin-error">{error}</div>}{message && <div className="admin-success">{message}</div>}<form className="product-form" onSubmit={saveProduct}><label>Product name<input name="name" value={form.name} onChange={change} placeholder="पानी की टंकी" required /></label><label>English name<input name="english" value={form.english} onChange={change} placeholder="Water Storage Tank" required /></label><div className="form-row"><label>Category<select name="category" value={form.category} onChange={change}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Price<input name="price" type="number" min="0" value={form.price} onChange={change} placeholder="2850" required /></label></div><label>Unit<input name="unit" value={form.unit} onChange={change} placeholder="से शुरू" required /></label><label className="image-upload-label">Product image<input type="file" accept="image/*" onChange={chooseImage} required={!editingId && !form.image} /><small>{imageFileName || (form.image ? 'Current image selected' : 'PNG, JPG या WEBP · अधिकतम 5MB')}</small></label><label className="image-url-label">या image URL<input name="image" type="url" value={form.image.startsWith('data:') ? '' : form.image} onChange={change} placeholder="https://..." required={!form.image} /></label>{form.image && <div className="image-preview"><img src={form.image} alt="Product preview" /><span><Image size={15} /> Preview</span></div>}<label className="checkbox-label"><input name="featured" type="checkbox" checked={form.featured} onChange={change} /> Popular product दिखाएं</label><button className="admin-primary" disabled={busy}>{editingId ? <Save size={16} /> : <Plus size={16} />}{busy ? 'Saving...' : editingId ? 'Save changes' : 'Add product'}</button></form></section><section className="admin-list-section"><div className="admin-section-heading"><div><span>LIVE CATALOG</span><h2>सभी products <b>{products.length}</b></h2></div></div><div className="admin-product-list">{products.map((product) => <article className="admin-product" key={product._id}><img src={product.image} alt="" /><div className="admin-product-info"><strong>{product.name}</strong><small>{product.english} · {product.category}</small><b>₹{product.price.toLocaleString('en-IN')} <em>{product.unit}</em></b></div><div className="admin-product-actions"><button onClick={() => editProduct(product)} aria-label="Edit product"><Pencil size={16} /></button><button onClick={() => deleteProduct(product._id)} aria-label="Delete product"><Trash2 size={16} /></button></div></article>)}{!products.length && <div className="admin-empty">अभी कोई product नहीं है। ऊपर से पहला product जोड़ें।</div>}</div></section></main><section className="admin-orders"><div className="admin-section-heading"><div><span>ORDER INBOX</span><h2>Buyer orders <b>{orders.length}</b></h2></div><button className="admin-refresh" onClick={loadOrders}>Refresh</button></div><div className="admin-order-list">{orders.map((order) => <article className="admin-order" key={order._id}><div className="admin-order-head"><div><strong>{order.buyer.name}</strong><small>{order.buyer.phone} · {new Date(order.createdAt).toLocaleString('en-IN')}</small></div><b>₹{order.total.toLocaleString('en-IN')}</b></div><div className="admin-buyer-address">{order.buyer.address}, {order.buyer.city} - {order.buyer.pincode}</div><div className="admin-order-items">{order.items.map((item) => <span key={`${order._id}-${item.id}`}><img src={item.image} alt="" />{item.name} × {item.quantity}</span>)}</div></article>)}{!orders.length && <div className="admin-empty">अभी कोई order नहीं आया है।</div>}</div></section></div>;
}
