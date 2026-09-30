import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService, categoryService, supplierService } from '../services/api';
import {
  Package,
  Plus,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Edit,
  Trash2,
  AlertTriangle,
  Upload,
  X,
  Check,
  Image as ImageIcon,
  DollarSign,
  Layers,
  Truck,
  RefreshCw,
  Star,
} from 'lucide-react';

const Products = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL, IN_STOCK, LOW_STOCK, OUT_OF_STOCK
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [deleteImageConfirmation, setDeleteImageConfirmation] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    quantity: '',
    minStockLevel: '5',
    categoryId: '',
    supplierId: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [primaryImage, setPrimaryImage] = useState(null);
  const [deletingImage, setDeletingImage] = useState(null);
  const [settingPrimary, setSettingPrimary] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Load all data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes, supRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        supplierService.getAll(),
      ]);
      setProducts(prodRes || []);
      setCategories(catRes || []);
      setSuppliers(supRes || []);
    } catch (err) {
      console.error('Error fetching catalog data:', err);
      setError('Failed to load products. Check that backend server is active on port 3000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle URL query parameters (e.g. ?action=new, ?filter=low, ?edit=1)
  useEffect(() => {
    const action = searchParams.get('action');
    const filter = searchParams.get('filter');
    const editId = searchParams.get('edit');

    if (action === 'new') {
      openCreateModal();
    }
    if (filter === 'low') {
      setStockFilter('LOW_STOCK');
    }
    if (editId && products.length > 0) {
      const p = products.find((item) => String(item.id) === String(editId));
      if (p) openEditModal(p);
    }
  }, [searchParams, products]);

  // Modal Handlers
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      costPrice: '',
      quantity: '',
      minStockLevel: '5',
      categoryId: categories[0]?.id ? String(categories[0].id) : '',
      supplierId: suppliers[0]?.id ? String(suppliers[0].id) : '',
    });
    setSelectedFiles([]);
    setFilePreviews([]);
    setExistingImages([]);
    setPrimaryImage(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      costPrice: product.costPrice || '',
      quantity: product.quantity ?? '',
      minStockLevel: product.minStockLevel ?? '5',
      categoryId: product.categoryId ? String(product.categoryId) : '',
      supplierId: product.supplierId ? String(product.supplierId) : '',
    });
    setSelectedFiles([]);
    setFilePreviews([]);
    const imgs = [];
    if (product.imageUrl) {
      imgs.push(product.imageUrl);
    }
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        if (!imgs.includes(img)) {
          imgs.push(img);
        }
      });
    }
    setExistingImages(imgs);
    setPrimaryImage(product.imageUrl || imgs[0] || null);
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setSelectedFiles([]);
    setFilePreviews([]);
    setExistingImages([]);
    setPrimaryImage(null);
    setDeleteImageConfirmation(null);
    setSearchParams({});
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setFilePreviews((prev) => [...prev, ...previews]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const requestDeleteExistingImage = (imgUrl) => {
    if (!editingProduct) {
      setExistingImages((prev) => prev.filter((url) => url !== imgUrl));
      return;
    }
    setDeleteImageConfirmation(imgUrl);
  };

  const confirmDeleteExistingImage = async () => {
    if (!deleteImageConfirmation || !editingProduct) return;
    const imgUrl = deleteImageConfirmation;

    setDeletingImage(imgUrl);
    try {
      const updatedProduct = await productService.deleteImage(editingProduct.id, imgUrl);
      const updatedList = updatedProduct.images || existingImages.filter((u) => u !== imgUrl);
      setExistingImages(updatedList);
      if (primaryImage === imgUrl) {
        setPrimaryImage(updatedProduct.imageUrl || updatedList[0] || null);
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
      );
      setEditingProduct(updatedProduct);
      setDeleteImageConfirmation(null);
    } catch (err) {
      console.error('Failed to delete image:', err);
      alert('Could not delete image. Please try again.');
    } finally {
      setDeletingImage(null);
    }
  };

  const handleSetPrimary = async (imgUrl) => {
    if (!editingProduct) {
      setPrimaryImage(imgUrl);
      return;
    }
    setSettingPrimary(imgUrl);
    try {
      const updatedProduct = await productService.setPrimaryImage(editingProduct.id, imgUrl);
      setPrimaryImage(imgUrl);
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
      );
      setEditingProduct(updatedProduct);
    } catch (err) {
      console.error('Failed to set primary image:', err);
    } finally {
      setSettingPrimary(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (!formData.categoryId) {
      setFormError('Please select a category.');
      return;
    }
    if (!formData.supplierId) {
      setFormError('Please select a supplier.');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setFormError('Selling price must be greater than 0.');
      return;
    }
    if (!formData.costPrice || Number(formData.costPrice) <= 0) {
      setFormError('Cost price must be greater than 0.');
      return;
    }

    setFormLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description || '');
      data.append('price', formData.price);
      data.append('costPrice', formData.costPrice);
      data.append('quantity', formData.quantity || 0);
      data.append('minStockLevel', formData.minStockLevel || 5);
      data.append('categoryId', formData.categoryId);
      data.append('supplierId', formData.supplierId);

      // Append all selected new files
      selectedFiles.forEach((file) => {
        data.append('files', file);
      });

      if (editingProduct) {
        await productService.update(editingProduct.id, data);
      } else {
        await productService.create(data);
      }

      await loadData();
      closeModal();
    } catch (err) {
      console.error('Failed to save product:', err);
      setFormError(
        err.response?.data?.message || 'Error saving product. Please check input requirements.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productService.delete(id);
      setProducts(products.filter((p) => p.id !== id));
      setDeleteConfirmation(null);
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Could not delete product. It may be linked to existing order items.');
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search Query
      const matchesSearch =
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category Filter
      const matchesCategory =
        selectedCategory === 'ALL' || String(p.categoryId) === String(selectedCategory);

      // Stock Filter
      let matchesStock = true;
      const qty = p.quantity || 0;
      const minStock = p.minStockLevel || 5;

      if (stockFilter === 'OUT_OF_STOCK') {
        matchesStock = qty === 0;
      } else if (stockFilter === 'LOW_STOCK') {
        matchesStock = qty > 0 && qty <= minStock;
      } else if (stockFilter === 'IN_STOCK') {
        matchesStock = qty > minStock;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-[#1d1d1f]" />
            Product Catalog
          </h2>
          <p className="text-xs text-[#86868b] mt-1">
            Manage inventory stock levels, prices, and Cloudinary media assets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Reload products"
            className="p-2.5 rounded-full bg-white hover:bg-[#f5f5f7] border border-black/8 text-[#1d1d1f] shadow-xs hover:shadow-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#1d1d1f]' : ''}`} />
          </button>

          {isAdmin && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold shadow-md shadow-black/15 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-black/8 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name or SKU..."
            className="w-full rounded-xl pl-10 pr-4 py-2 text-xs text-[#1d1d1f] placeholder-[#86868b] bg-[#f5f5f7] border border-black/8 focus:border-[#1d1d1f] focus:bg-white focus:outline-none transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl px-3 py-2 text-xs text-[#1d1d1f] bg-[#f5f5f7] border border-black/8 focus:border-[#1d1d1f] focus:bg-white focus:outline-none transition"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Level Dropdown */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="rounded-xl px-3 py-2 text-xs text-[#1d1d1f] bg-[#f5f5f7] border border-black/8 focus:border-[#1d1d1f] focus:bg-white focus:outline-none transition"
          >
            <option value="ALL">All Stock States</option>
            <option value="IN_STOCK">In Stock (Healthy)</option>
            <option value="LOW_STOCK">Low Stock (Alert)</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#f5f5f7] border border-black/8 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-[#1d1d1f] text-white shadow-xs font-semibold' : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-[#1d1d1f] text-white shadow-xs font-semibold' : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#86868b]">Loading catalog items...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-black/8 shadow-sm">
          <Package className="w-12 h-12 text-[#86868b] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1d1d1f] mb-1">No Products Found</h3>
          <p className="text-xs text-[#86868b] mb-6">
            Try adjusting your search filters or browse other categories.
          </p>
          {isAdmin && (
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold shadow-md shadow-black/15 transition"
            >
              Create Product
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const isOutOfStock = (p.quantity || 0) === 0;
            const isLowStock = (p.quantity || 0) <= (p.minStockLevel || 5) && !isOutOfStock;

            return (
              <div
                key={p.id}
                className="bg-white border border-black/8 rounded-2xl overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition duration-300"
              >
                <div>
                  {/* Image Container with Badges */}
                  <div className="relative h-48 w-full bg-[#f5f5f7] overflow-hidden flex items-center justify-center p-3">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#86868b] gap-2">
                        <ImageIcon className="w-8 h-8 stroke-1" />
                        <span className="text-[11px] font-medium">No Image</span>
                      </div>
                    )}

                    {/* Multi-Photo Count Badge */}
                    {p.images && p.images.length > 1 && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-md shadow flex items-center gap-1 border border-white/20">
                          <ImageIcon className="w-3 h-3 text-white" />
                          {p.images.length} photos
                        </span>
                      </div>
                    )}

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 right-3">
                      {isOutOfStock ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#ff3b30] text-white shadow">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#ff9500] text-white shadow">
                          Low: {p.quantity} left
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#34c759] text-white shadow">
                          {p.quantity} in stock
                        </span>
                      )}
                    </div>

                    {/* Category Pill */}
                    {p.categoryName && (
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/80 text-[#1d1d1f] backdrop-blur-md border border-black/8 shadow-xs">
                          {p.categoryName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-[#1d1d1f] tracking-tight truncate mb-1">
                      {p.name}
                    </h3>
                    <p className="text-xs text-[#86868b] line-clamp-2 h-8 mb-3">
                      {p.description || 'No description provided.'}
                    </p>

                    <div className="flex items-baseline justify-between pt-2 border-t border-black/8">
                      <div>
                        <span className="text-base font-bold text-[#1d1d1f]">
                          ${Number(p.price || 0).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[#86868b] ml-1.5">
                          Cost: ${Number(p.costPrice || 0).toFixed(2)}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#86868b] font-mono">
                        SKU #{p.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="p-3 bg-[#f5f5f7] border-t border-black/8 flex items-center justify-between">
                  <span className="text-[11px] text-[#86868b] truncate max-w-30">
                    {p.supplierName ? `Vendor: ${p.supplierName}` : 'In Stock'}
                  </span>
                  {isAdmin ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(p)}
                        title="Edit Product"
                        className="p-1.5 rounded-lg bg-white hover:bg-black/5 text-[#1d1d1f] border border-black/8 transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmation(p)}
                        title="Delete Product"
                        className="p-1.5 rounded-lg bg-white hover:bg-red-50 text-[#ff3b30] border border-black/8 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-semibold text-[#1da441] bg-[#30d158]/10 px-2 py-0.5 rounded-md border border-[#30d158]/20">
                      Available
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl overflow-hidden border border-black/8 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/8 text-[#86868b] uppercase tracking-wider bg-[#f5f5f7]">
                  <th className="py-3 px-4 font-semibold">Product</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Supplier</th>
                  <th className="py-3 px-4 font-semibold">Cost</th>
                  <th className="py-3 px-4 font-semibold">Price</th>
                  <th className="py-3 px-4 font-semibold">Stock Qty</th>
                  {isAdmin && <th className="py-3 px-4 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/8">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#f5f5f7] transition">
                    <td className="py-3 px-4 font-medium text-[#1d1d1f] flex items-center gap-3">
                      <div className="relative shrink-0">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-contain p-0.5 bg-[#f5f5f7] border border-black/8"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[#f5f5f7] border border-black/8 flex items-center justify-center text-[#86868b]">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                        {p.images && p.images.length > 1 && (
                          <span className="absolute -bottom-1 -right-1 px-1 rounded bg-[#1d1d1f] text-[8px] font-bold text-white shadow">
                            +{p.images.length - 1}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1d1d1f]">{p.name}</p>
                        <p className="text-[10px] text-[#86868b] font-mono">SKU #{p.id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#1d1d1f]">{p.categoryName || '-'}</td>
                    <td className="py-3 px-4 text-[#1d1d1f]">{p.supplierName || '-'}</td>
                    <td className="py-3 px-4 text-[#86868b]">
                      ${Number(p.costPrice || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#1d1d1f]">
                      ${Number(p.price || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {(p.quantity || 0) === 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#ff3b30]/12 text-[#d70015] border border-[#ff3b30]/25">
                          Out of Stock
                        </span>
                      ) : (p.quantity || 0) <= (p.minStockLevel || 5) ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#ff9500]/12 text-[#b25000] border border-[#ff9500]/25">
                          Low: {p.quantity}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#34c759]/12 text-[#248a3d] border border-[#34c759]/25">
                          {p.quantity} units
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg bg-white hover:bg-black/5 text-[#1d1d1f] border border-black/8 transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmation(p)}
                            className="p-1.5 rounded-lg bg-white hover:bg-red-50 text-[#ff3b30] border border-black/8 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-black/8 shadow-[0_20px_60px_rgba(0,0,0,0.18)] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-black/8">
              <div>
                <h3 className="text-lg font-bold text-[#1d1d1f]">
                  {editingProduct ? 'Edit Catalog Product' : 'Add New Product'}
                </h3>
                <p className="text-xs text-[#86868b]">
                  Fill in product details and upload an image to Cloudinary
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error in Form */}
            {formError && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-[#ff3b30] text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Wireless Ergonomic Mouse"
                  className="w-full rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] placeholder-[#86868b] bg-[#f5f5f7] border border-black/8 focus:border-[#1d1d1f] focus:bg-white focus:outline-none transition"
                  required
                />
              </div>

              {/* Category & Supplier Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] bg-[#f5f5f7] border border-black/8 focus:border-[#1d1d1f] focus:bg-white focus:outline-none transition"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                    Supplier *
                  </label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] bg-[#f5f5f7] border border-black/8 focus:border-[#1d1d1f] focus:bg-white focus:outline-none transition"
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Quantities */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                    Cost Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="15.00"
                    className="w-full rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] bg-[#f5f5f7] border border-black/8 focus:border-[#1d1d1f] focus:bg-white focus:outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                    Selling Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="29.99"
                    className="w-full rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] bg-[#f5f5f7] border border-black/8 focus:border-[#1d1d1f] focus:bg-white focus:outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="50"
                    className="w-full rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] bg-[#f5f5f7] border border-black/8 focus:border-[#1d1d1f] focus:bg-white focus:outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                    Min Safety Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                    placeholder="5"
                    className="w-full rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] bg-[#f5f5f7] border border-black/8 focus:border-[#1d1d1f] focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide specifications, features, or notes..."
                  rows={2}
                  className="w-full rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] placeholder-[#86868b] bg-[#f5f5f7] border border-black/8 focus:border-[#1d1d1f] focus:bg-white focus:outline-none transition"
                />
              </div>

              {/* Product Images Manager (Multi-Photo Cloudinary Gallery) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                    Product Photos ({existingImages.length + selectedFiles.length})
                  </label>
                  <span className="text-[10px] text-[#86868b]">
                    Supports multiple photos & Cloudinary sync
                  </span>
                </div>

                {/* Existing Cloudinary Photos Gallery */}
                {existingImages.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-[#f5f5f7] border border-black/8 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#1d1d1f]" />
                        Uploaded Photos ({existingImages.length})
                      </p>
                      <span className="text-[10px] text-[#86868b]">Click ✕ to delete or 'Cover' to set primary</span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                      {existingImages.map((imgUrl, idx) => {
                        const isCover = primaryImage === imgUrl || (!primaryImage && idx === 0);
                        const isDeleting = deletingImage === imgUrl;
                        const isSetting = settingPrimary === imgUrl;
                        return (
                          <div
                            key={imgUrl}
                            className={`relative group rounded-xl overflow-hidden aspect-square border transition ${
                              isCover
                                ? 'border-[#1d1d1f] ring-2 ring-[#1d1d1f]/30 shadow-xs'
                                : 'border-black/8 hover:border-black/20'
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />

                            {/* Cover Badge */}
                            {isCover && (
                              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#1d1d1f] text-white shadow flex items-center gap-0.5 z-10">
                                <Star className="w-2.5 h-2.5 fill-current" /> Cover
                              </div>
                            )}

                            {/* Hover Actions Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-1.5 z-20">
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={() => requestDeleteExistingImage(imgUrl)}
                                  title="Delete this photo from Cloudinary"
                                  className="p-1 rounded-lg bg-red-600/90 hover:bg-red-600 text-white transition disabled:opacity-50"
                                >
                                  {isDeleting ? (
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </button>
                              </div>

                              {!isCover && (
                                <button
                                  type="button"
                                  disabled={isSetting}
                                  onClick={() => handleSetPrimary(imgUrl)}
                                  className="w-full py-1 rounded-lg bg-[#1d1d1f] hover:bg-[#333336] text-[9px] font-bold text-white transition disabled:opacity-50"
                                >
                                  {isSetting ? 'Setting...' : 'Set as Cover'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Newly Selected Files Previews */}
                {filePreviews.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-black/5 border border-black/15 space-y-2">
                    <p className="text-[11px] font-semibold text-[#1d1d1f]">
                      New Photos Ready to Upload ({filePreviews.length}):
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                      {filePreviews.map((previewUrl, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-xl overflow-hidden aspect-square border border-black/8"
                        >
                          <img
                            src={previewUrl}
                            alt="New preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(idx)}
                            title="Remove file"
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-red-600 text-white transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 right-1 px-1 py-0.5 rounded bg-black/70 text-[8px] text-white truncate">
                            {selectedFiles[idx]?.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multi-file Input Picker */}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-black/14 hover:border-[#1d1d1f] rounded-2xl p-4 text-center cursor-pointer transition bg-[#f5f5f7] hover:bg-black/5">
                  <Upload className="w-5 h-5 text-[#86868b] mb-1" />
                  <span className="text-xs font-semibold text-[#1d1d1f]">
                    {selectedFiles.length > 0
                      ? `Add more photos (${selectedFiles.length} selected)`
                      : 'Choose photos to upload (select multiple)'}
                  </span>
                  <p className="text-[10px] text-[#86868b] mt-0.5">
                    PNG, JPG, WEBP • Click or drag to add multiple photos
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilesChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-full bg-[#f5f5f7] hover:bg-black/5 text-xs font-semibold text-[#1d1d1f] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold shadow-md shadow-black/15 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {formLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 border border-black/8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-[#ff3b30] flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1d1d1f] mb-1">Delete Product?</h3>
            <p className="text-xs text-[#86868b] mb-5">
              Are you sure you want to remove{' '}
              <strong className="text-[#1d1d1f]">"{deleteConfirmation.name}"</strong>? This action
              cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-5 py-2 rounded-full bg-[#f5f5f7] hover:bg-black/5 text-xs font-semibold text-[#1d1d1f]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmation.id)}
                className="px-5 py-2 rounded-full bg-[#ff3b30] hover:bg-[#e03126] text-xs font-semibold text-white shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE PHOTO CONFIRMATION MODAL */}
      {deleteImageConfirmation && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 border border-black/8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-[#ff3b30] flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1d1d1f] mb-1">Delete Product Photo?</h3>
            <p className="text-xs text-[#86868b] mb-4">
              Are you sure you want to permanently remove this photo from Cloudinary? This action cannot be undone.
            </p>

            {/* Photo Thumbnail Preview */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-black/8 mx-auto mb-5 shadow-xs">
              <img
                src={deleteImageConfirmation}
                alt="Photo to delete"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteImageConfirmation(null)}
                disabled={deletingImage !== null}
                className="px-5 py-2 rounded-full bg-[#f5f5f7] hover:bg-black/5 text-xs font-semibold text-[#1d1d1f] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingImage !== null}
                onClick={confirmDeleteExistingImage}
                className="px-5 py-2 rounded-full bg-[#ff3b30] hover:bg-[#e03126] text-xs font-semibold text-white shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {deletingImage ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
