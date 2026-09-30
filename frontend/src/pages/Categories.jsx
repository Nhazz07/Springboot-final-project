import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { categoryService } from '../services/api';
import { Tags, Plus, Search, Edit, Trash2, X, Check, AlertTriangle, RefreshCw } from 'lucide-react';

const Categories = () => {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <Navigate to="/products" replace />;
  }

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAll();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Could not connect to backend to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description || '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setFormLoading(true);
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
      } else {
        await categoryService.create(formData);
      }
      await loadCategories();
      closeModal();
    } catch (err) {
      console.error('Failed to save category:', err);
      setFormError(err.response?.data?.message || 'Error saving category.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await categoryService.delete(id);
      setCategories(categories.filter((c) => c.id !== id));
      setDeleteConfirmation(null);
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert('Could not delete category. It may contain linked products.');
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight flex items-center gap-2.5">
            <Tags className="w-6 h-6 text-[#1d1d1f]" />
            Category Management
          </h2>
          <p className="text-xs text-[#86868b] mt-1">
            Organize catalog inventory into structured departments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCategories}
            className="p-2.5 rounded-full bg-white hover:bg-[#f5f5f7] border border-black/8 text-[#86868b] hover:text-[#1d1d1f] shadow-xs hover:shadow-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold shadow-md shadow-black/15 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-black/8 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by name or description..."
            className="w-full bg-[#f5f5f7] border border-black/8 rounded-xl pl-10 pr-4 py-2 text-xs text-[#1d1d1f] placeholder-[#86868b] focus:outline-hidden focus:border-[#1d1d1f] transition"
          />
        </div>
        <span className="text-xs text-[#86868b] hidden sm:inline">
          {filteredCategories.length} categories
        </span>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#86868b]">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-black/8 shadow-sm">
          <Tags className="w-12 h-12 text-[#86868b] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1d1d1f] mb-1">No Categories Found</h3>
          <p className="text-xs text-[#86868b] mb-6">
            Get started by creating your first product category.
          </p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold shadow-md shadow-black/15 transition"
          >
            Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl p-5 border border-black/8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1d1d1f]/8 border border-[#1d1d1f]/15 flex items-center justify-center text-[#1d1d1f]">
                    <Tags className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-black/5 text-[#86868b] border border-black/8">
                    ID #{cat.id}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#1d1d1f] tracking-tight mb-1.5">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#86868b] line-clamp-3">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-2 rounded-xl bg-[#f5f5f7] hover:bg-[#1d1d1f]/10 text-[#6e6e73] hover:text-[#1d1d1f] transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmation(cat)}
                  className="p-2 rounded-xl bg-[#f5f5f7] hover:bg-red-500/10 text-[#6e6e73] hover:text-[#ff3b30] transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 border border-black/8 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/8">
              <h3 className="text-lg font-bold text-[#1d1d1f]">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={closeModal} className="p-2 text-[#86868b] hover:text-[#1d1d1f]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[#ff3b30] text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Peripherals & Audio"
                  className="w-full bg-[#f5f5f7] border border-black/10 rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] focus:outline-hidden focus:border-[#1d1d1f]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description of items in this category..."
                  rows={3}
                  className="w-full bg-[#f5f5f7] border border-black/10 rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] focus:outline-hidden focus:border-[#1d1d1f]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-full bg-[#f5f5f7] hover:bg-black/5 text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold shadow-md shadow-black/15 flex items-center gap-2"
                >
                  {formLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingCategory ? 'Update' : 'Create'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 border border-black/8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-[#ff3b30] flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1d1d1f] mb-1">Delete Category?</h3>
            <p className="text-xs text-[#86868b] mb-5">
              Are you sure you want to remove{' '}
              <strong className="text-[#1d1d1f]">"{deleteConfirmation.name}"</strong>? Products in this
              category may need re-assigning.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 rounded-full bg-[#f5f5f7] hover:bg-black/5 text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmation.id)}
                className="px-5 py-2 rounded-full bg-[#ff3b30] hover:bg-[#ff3b30]/90 text-xs font-semibold text-white shadow-md shadow-[#ff3b30]/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
