import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi, categoryApi, uploadApi } from '@/services';
import { getErrorMessage } from '@/services/api';
import { Category } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { toast } from 'react-toastify';

export default function AddProductPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    stock: '',
    isFeatured: false,
    isNewArrival: false,
  });

  useEffect(() => {
    categoryApi.getAll(true).then((res) => {
      setCategories(res.data.data as Category[]);
    }).catch(console.error);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...files]);
      
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setErrors({});

    if (imageFiles.length === 0) {
      setErrors({ images: 'Please upload at least one image' });
      setSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      imageFiles.forEach(file => formData.append('images', file));
      const uploadRes = await uploadApi.uploadImages(formData);
      // @ts-ignore
      const uploadedUrls = uploadRes.data.data?.urls || [];

      if (uploadedUrls.length === 0) {
        throw new Error('Image upload failed');
      }

      const payload = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        compareAtPrice: form.discountPrice ? parseFloat(form.discountPrice) : undefined,
        images: uploadedUrls,
        category: form.category,
        stock: parseInt(form.stock),
        isFeatured: form.isFeatured,
        isNewArrival: form.isNewArrival,
      };

      await productApi.create(payload);
      toast.success('Product added successfully.');
      navigate('/admin/products');
    } catch (err) {
      setError(getErrorMessage(err));
      toast.error('Failed to add product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8 flex items-center justify-between border-b border-[#E5DCC5]/40 pb-4">
        <h1 className="text-3xl font-display font-bold text-[#7A0019]">Add New Product</h1>
        <Button onClick={() => navigate('/admin/products')} variant="outline" className="text-[#2C1810]">
          Cancel
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-[#E5DCC5]/40 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 font-semibold border border-red-200">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Product Name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="md:col-span-2" />
            
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={[
                { value: '', label: 'Select category' },
                ...categories.map((c) => ({ value: c._id, label: c.name })),
              ]}
              required
            />
            
            <Input label="Stock Quantity" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            
            <Input label="Price (₹)" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <Input label="Discount Price (₹)" type="number" step="0.01" min="0" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
          </div>

          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} required />

          <div className="space-y-3 bg-[#F8F4E8]/50 p-6 rounded-xl border border-[#E5DCC5]/30">
            <label className="block text-sm font-bold text-[#2C1810] uppercase tracking-wider">Product Images</label>
            <p className="text-xs text-gray-500 mb-2">Upload multiple images. The first image will be the main thumbnail.</p>
            
            <div 
              onDragOver={(e) => e.preventDefault()} 
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) {
                  const files = Array.from(e.dataTransfer.files);
                  setImageFiles((prev) => [...prev, ...files]);
                  files.forEach((file) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreviews((prev) => [...prev, reader.result as string]);
                    };
                    reader.readAsDataURL(file);
                  });
                }
              }}
              className="border-2 border-dashed border-[#D4AF37] rounded-xl p-8 text-center bg-white hover:bg-[#F8F4E8]/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById('fileUpload')?.click()}
            >
              <div className="text-4xl mb-3">📸</div>
              <p className="text-sm font-bold text-[#2C1810]">Click or drag images here to upload</p>
              <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, WEBP</p>
              <input 
                id="fileUpload"
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className="flex gap-4 flex-wrap mt-4">
                {imagePreviews.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt={`Preview ${i}`} className="h-24 w-24 object-cover rounded-lg border-2 border-[#D4AF37] shadow-sm" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors shadow-md md:opacity-0 group-hover:opacity-100">×</button>
                  </div>
                ))}
              </div>
            )}
            {errors.images && <p className="text-xs text-red-500 font-semibold">{errors.images}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 bg-[#F8F4E8]/50 p-6 rounded-xl border border-[#E5DCC5]/30">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="h-5 w-5 rounded border-[#D4AF37] text-[#7A0019] focus:ring-[#7A0019]" />
              <span className="text-sm font-bold text-[#2C1810] group-hover:text-[#7A0019] transition-colors">Featured Product</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })} className="h-5 w-5 rounded border-[#D4AF37] text-[#7A0019] focus:ring-[#7A0019]" />
              <span className="text-sm font-bold text-[#2C1810] group-hover:text-[#7A0019] transition-colors">New Arrival</span>
            </label>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E5DCC5] z-40 md:static md:bg-transparent md:border-0 md:p-0 md:flex md:justify-end pb-safe">
            <Button type="submit" loading={saving} className="w-full md:w-auto bg-[#D4AF37] hover:bg-[#C5A017] text-white px-8 py-3 text-sm rounded-full shadow-lg">
              Save Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
