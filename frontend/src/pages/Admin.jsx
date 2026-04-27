import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Navigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Admin() {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [editingProductId, setEditingProductId] = useState(null);
  const [imageMode, setImageMode] = useState('url');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    price: '',
    description: '',
    image: ''
  });

  React.useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load products');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Vegetables',
      price: '',
      description: '',
      image: ''
    });
    setEditingProductId(null);
    setImageMode('url');
    setSelectedImageFile(null);
    setImagePreview('');
  };

  const upsertProductInState = (product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [product, ...prev];
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setSelectedImageFile(file);
    setImageMode('file');
    setImagePreview(URL.createObjectURL(file));
    toast.success('Image selected');
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    setImageMode(product.image?.startsWith('data:') ? 'file' : 'url');
    setFormData({
      name: product.name,
      category: product.category,
      price: String(product.price),
      description: product.description,
      image: product.image
    });
  };

  const handleDelete = async (productId) => {
    toast.custom((toastInstance) => (
      <div className="w-[420px] max-w-[96vw] rounded-2xl border border-red-200 bg-white shadow-xl">
        <div className="p-4 border-b border-red-100 bg-red-50/70">
          <p className="text-sm font-semibold text-red-800">Delete product?</p>
          <p className="mt-1 text-xs text-red-700">This action cannot be undone.</p>
        </div>
        <div className="flex gap-2 p-4">
          <button
            type="button"
            onClick={() => toast.dismiss(toastInstance.id)}
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              toast.dismiss(toastInstance.id);
              try {
                await api.delete(`/products/${productId}`);
                setProducts((prev) => prev.filter((p) => p.id !== productId));
                toast.success('Product deleted');

                if (editingProductId === productId) {
                  resetForm();
                }
              } catch (error) {
                console.error(error);
                toast.error('Error deleting product');
              }
            }}
            className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 10000, position: 'top-center' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageValue = formData.image;

      if (imageMode === 'file' && selectedImageFile) {
        imageValue = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(new Error('Could not read image file'));
          reader.readAsDataURL(selectedImageFile);
        });
      }

      if (!imageValue) {
        toast.error('Please provide an image URL or choose a file');
        return;
      }

      const payload = {
        ...formData,
        image: imageValue,
      };

      if (editingProductId) {
        const response = await api.put(`/products/${editingProductId}`, payload);
        upsertProductInState(response.data);
        toast.success('Product updated successfully');
      } else {
        const response = await api.post('/products', payload);
        upsertProductInState(response.data);
        toast.success('Product added successfully');
      }
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
          ← Back to shop
        </Link>
        <p className="text-sm text-gray-500">Admin can add, edit, delete, and view all products here.</p>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {editingProductId ? 'Edit Product' : 'Add New Product'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="e.g. Fresh Apples"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Cakes">Cakes</option>
                <option value="Biscuits">Biscuits</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (LKR)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image Source</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`py-2 rounded-xl border text-sm font-medium transition-all ${imageMode === 'url' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                >
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageMode('file');
                    setFormData((prev) => ({ ...prev, image: '' }));
                  }}
                  className={`py-2 rounded-xl border text-sm font-medium transition-all ${imageMode === 'file' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                >
                  Upload File
                </button>
              </div>

              {imageMode === 'url' ? (
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  required={imageMode === 'url'}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="https://images.unsplash.com/..."
                />
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                />
              )}
            </div>

            {(imagePreview || formData.image) && (
              <div className="rounded-xl border border-gray-200 p-2 bg-gray-50">
                <img src={imagePreview || formData.image} alt="Preview" className="h-40 w-full object-contain rounded-lg bg-white" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                placeholder="Product description..."
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingProductId ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">All Products</h3>

          {loadingProducts ? (
            <div className="text-sm text-gray-500">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-sm text-gray-500">No products found.</div>
          ) : (
            <ul className="space-y-3 max-h-[760px] overflow-y-auto pr-1">
              {products.map((product) => (
                <li key={product.id} className="border border-gray-200 rounded-xl p-3">
                  <div className="flex gap-3">
                    <img src={product.image} alt={product.name} className="h-20 w-20 rounded-lg object-contain bg-gray-100" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                      <p className="text-sm text-gray-700 font-medium mt-1">Rs. {Number(product.price).toFixed(2)}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(product)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
