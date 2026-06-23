import { useEffect, useState, FormEvent } from 'react';
import { productApi, categoryApi, uploadApi } from '@/services';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '@/services/api';
import { Product, Category } from '@/types';
import { formatPrice } from '@/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';

const emptyProduct = {
  title: '',
  description: '',
  price: '',
  compareAtPrice: '',
  images: '',
  category: '',
  stock: '',
  isFeatured: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        productApi.getAll({ limit: 100 }),
        categoryApi.getAll(true),
      ]);
      setProducts(prodRes.data.data as Product[]);
      setCategories(catRes.data.data as Category[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);



  const openEdit = (product: Product) => {
    setEditingId(product._id);
    setForm({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      compareAtPrice: product.compareAtPrice?.toString() || '',
      images: product.images.join('\n'),
      category: typeof product.category === 'object' ? product.category._id : product.category,
      stock: product.stock.toString(),
      isFeatured: product.isFeatured,
    });
    setErrors({});
    setImageFiles([]);
    setExistingImages(product.images || []);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setErrors({});

    try {
      let uploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach(file => formData.append('images', file));
        const uploadRes = await uploadApi.uploadImages(formData);
        // @ts-ignore - The response type might not exactly match
        uploadedUrls = uploadRes.data.data?.urls || [];
      }

      const finalImages = [...existingImages, ...uploadedUrls];
      if (finalImages.length === 0) {
        setErrors({ images: 'Please upload at least one image' });
        setSaving(false);
        return;
      }

      const payload = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
        images: finalImages,
        category: form.category,
        stock: parseInt(form.stock),
        isFeatured: form.isFeatured,
      };

      if (editingId) {
        await productApi.update(editingId, payload);
      } else {
        await productApi.create(payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productApi.delete(id);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (loading) return <Spinner size="lg" className="min-h-[400px]" />;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link to="/admin/products/new" className="inline-flex items-center justify-center rounded-full bg-[#7A0019] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#5A0012] shadow-md">Add Product</Link>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted">
              <th className="p-4">Product</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Featured</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!products || products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-4xl mb-4">🛍️</div>
                    <p className="text-lg font-medium">No products found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]} alt="" className="h-10 w-10 rounded object-cover border border-gray-200" />
                      <span className="font-medium text-[#2C1810]">{product.title}</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-[#7A0019]">{formatPrice(product.price)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="p-4">{product.isFeatured ? '⭐ Yes' : '—'}</td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(product)} className="text-[#D4AF37] hover:text-[#C5A017] font-bold uppercase tracking-wider text-[11px]">Edit</button>
                      <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-700 font-bold uppercase tracking-wider text-[11px]">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {!products || products.length === 0 ? (
          <div className="card p-8 text-center text-muted">
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl mb-4">🛍️</div>
              <p className="text-lg font-medium">No products found.</p>
            </div>
          </div>
        ) : (
          products.map((product) => (
            <div key={product._id} className="card p-4 flex flex-col gap-3">
              <div className="flex items-start gap-4">
                <img src={product.images[0]} alt="" className="h-20 w-20 rounded-lg object-cover border border-[#E5DCC5] shadow-sm shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-[#2C1810] leading-tight mb-1 line-clamp-2">{product.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-[#7A0019] text-sm">{formatPrice(product.price)}</span>
                    {product.isFeatured && (
                      <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {product.stock} in stock
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#E5DCC5]/40 flex gap-3">
                <button 
                  onClick={() => openEdit(product)} 
                  className="flex-1 py-2 bg-[#F8F4E8] text-[#2C1810] border border-[#E5DCC5] rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-[#EFE9D8] transition-colors shadow-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(product._id)} 
                  className="flex-1 py-2 bg-white border-2 border-red-100 text-red-600 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-red-50 transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <Input label="Compare At Price" type="number" step="0.01" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} />
          </div>
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={[
              { value: '', label: 'Select category' },
              ...categories.map((c) => ({ value: c._id, label: c.name })),
            ]}
          />
          <Input label="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
          <div className="space-y-2">
            <label className="label">Product Images</label>
            {existingImages.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {existingImages.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="h-16 w-16 object-cover rounded" />
                    <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, index) => index !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 text-xs w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors">×</button>
                  </div>
                ))}
              </div>
            )}
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={(e) => {
                if (e.target.files) setImageFiles(Array.from(e.target.files));
              }}
              className="input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer"
            />
            {errors.images && <p className="text-xs text-red-500">{errors.images}</p>}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent" />
            Featured product
          </label>
          <Button type="submit" loading={saving} className="w-full">
            {editingId ? 'Update' : 'Create'} Product
          </Button>
        </form>
      </Modal>
    </div>
  );
}
