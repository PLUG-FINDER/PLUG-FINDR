import React, { useState, useEffect } from 'react';
import { vendorAPI, Product } from '../../api/vendor';
import Loader from '../../components/Loader';
import { getImageUrl } from '../../utils/imageUtils';
import BackButton from '../../components/BackButton';
import './VendorPages.css';

const VendorMarket: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('₦');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Common currencies
  const currencies = ['₦', '$', '£', '€', 'GH₵', 'R'];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await vendorAPI.getMyProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !file) {
      setError('Product name and image are required.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('name', name);
    if (price) formData.append('price', price);
    formData.append('currency', currency);
    if (description) formData.append('description', description);
    if (file) formData.append('image', file);

    try {
      if (editingProduct) {
        const updatedProduct = await vendorAPI.updateProduct(editingProduct._id, formData);
        setProducts(products.map(p => p._id === editingProduct._id ? updatedProduct : p));
        setSuccess('Product updated successfully!');
      } else {
        if (!file) {
            setError('Product image is required.');
            setUploading(false);
            return;
        }
        const newProduct = await vendorAPI.addProduct(formData);
        setProducts([newProduct, ...products]);
        setSuccess('Product added successfully!');
      }
      
      // Reset form
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${editingProduct ? 'update' : 'add'} product.`);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setCurrency('₦');
    setDescription('');
    setFile(null);
    setEditingProduct(null);
    const fileInput = document.getElementById('productImage') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price ? product.price.toString() : '');
    setCurrency(product.currency || '₦');
    setDescription(product.description || '');
    setFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await vendorAPI.deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container">
      <BackButton />
      <h1 className="page-title">My Market</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-form">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            {editingProduct && (
                <button 
                    type="button" 
                    onClick={resetForm}
                    className="cancel-btn"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                >
                    Cancel Edit
                </button>
            )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="productName">Product Name *</label>
              <input
                id="productName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Custom T-Shirt"
                required
              />
            </div>
            <div className="form-field" style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
              <div style={{ flex: '0 0 100px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label htmlFor="productCurrency">Currency</label>
                <select
                  id="productCurrency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  {currencies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label htmlFor="productPrice">Price (Optional)</label>
                <input
                  id="productPrice"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 5000"
                  min="0"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="productDescription">Description (Optional)</label>
            <textarea
              id="productDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product..."
              rows={3}
              style={{ minHeight: '80px' }}
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="productImage">Product Image {editingProduct ? '(Leave empty to keep current)' : '*'}</label>
            <input
              id="productImage"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required={!editingProduct}
            />
          </div>

          <button type="submit" className="submit-button" disabled={uploading}>
            {uploading ? (editingProduct ? 'Updating...' : 'Adding...') : (editingProduct ? 'Update Product' : 'Add Product')}
          </button>
        </form>
      </div>

      <div className="flyers-section" style={{ marginTop: '2rem' }}>
        <h2>My Products</h2>
        {products.length === 0 ? (
          <p className="no-reviews">No products added yet.</p>
        ) : (
          <div className="flyers-grid">
            {products.map((product) => (
              <div key={product._id} className="flyer-item">
                <img 
                  src={getImageUrl(product.image)} 
                  alt={product.name} 
                  className="flyer-image"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    console.error(`[Image Error] Failed to load product image for ${product.name}:`, {
                      originalUrl: product.image,
                      fullUrl: getImageUrl(product.image),
                      productId: product._id
                    });
                    img.src = 'https://via.placeholder.com/300x200?text=No+Image';
                  }}
                  onLoad={() => {
                    console.log(`[Image Success] Loaded product image for ${product.name}:`, getImageUrl(product.image));
                  }}
                />
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{product.name}</h3>
                  {product.description && (
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                      {product.description}
                    </p>
                  )}
                  {product.price && (
                    <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--primary-600)' }}>
                      {product.currency || '₦'}{product.price.toLocaleString()}
                    </p>
                  )}
                </div>
                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => handleEdit(product)}
                        className="remove-button"
                        style={{ background: 'var(--primary-600)', position: 'static' }}
                        title="Edit Product"
                    >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    </button>
                    <button
                    onClick={() => handleDelete(product._id)}
                    className="remove-button"
                    style={{ position: 'static' }}
                    title="Delete Product"
                    >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorMarket;

