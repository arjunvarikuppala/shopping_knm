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

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyProduct);
    setErrors({});
    setImageFiles([]);
    setExistingImages([]);
    setModalOpen(true);
  };

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

      <div className="card overflow-x-auto">
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
            {products.map((product) => (
              <tr key={product._id} className="border-b last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={product.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                    <span className="font-medium">{product.title}</span>
                  </div>
                </td>
                <td className="p-4">{formatPrice(product.price)}</td>
                <td className="p-4">{product.stock}</td>
                <td className="p-4">{product.isFeatured ? '✓' : '—'}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(product)} className="text-accent hover:underline">Edit</button>
                    <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
