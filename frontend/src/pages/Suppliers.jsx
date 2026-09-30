import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supplierService } from '../services/api';
import {
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  User,
  Upload,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';

const Suppliers = () => {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <Navigate to="/products" replace />;
  }

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const loadSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supplierService.getAll();
      setSuppliers(data || []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
      setError('Could not connect to backend to fetch suppliers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const openCreateModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
    });
    setSelectedFile(null);
    setImagePreview(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      contactName: sup.contactName || '',
      email: sup.email || '',
      phone: sup.phone || '',
      address: sup.address || '',
    });
    setSelectedFile(null);
    setImagePreview(sup.imageUrl || null);
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Supplier name is required.');
      return;
    }

    setFormLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('contactName', formData.contactName || '');
      data.append('email', formData.email || '');
      data.append('phone', formData.phone || '');
      data.append('address', formData.address || '');

      if (selectedFile) {
        data.append('file', selectedFile);
      } else if (editingSupplier?.imageUrl) {
        data.append('imageUrl', editingSupplier.imageUrl);
      }

      if (editingSupplier) {
        await supplierService.update(editingSupplier.id, data);
      } else {
        await supplierService.create(data);
      }
      await loadSuppliers();
      closeModal();
    } catch (err) {
      console.error('Failed to save supplier:', err);
      setFormError(err.response?.data?.message || 'Error saving supplier.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await supplierService.delete(id);
      setSuppliers(suppliers.filter((s) => s.id !== id));
      setDeleteConfirmation(null);
    } catch (err) {
      console.error('Failed to delete supplier:', err);
      alert('Could not delete supplier. It may be linked to products in catalog.');
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-[#af52de]" />
            Supplier Directory
          </h2>
          <p className="text-xs text-[#86868b] mt-1">
            Manage vendor networks, supply contracts, logos, and representative contact information
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadSuppliers}
            className="p-2.5 rounded-full bg-white hover:bg-[#f5f5f7] border border-black/8 text-[#86868b] hover:text-[#1d1d1f] shadow-xs hover:shadow-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold shadow-md shadow-black/15 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
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
            placeholder="Search suppliers by vendor name, contact, or email..."
            className="w-full bg-[#f5f5f7] border border-black/8 rounded-xl pl-10 pr-4 py-2 text-xs text-[#1d1d1f] placeholder-[#86868b] focus:outline-hidden focus:border-[#1d1d1f] transition"
          />
        </div>
        <span className="text-xs text-[#86868b] hidden sm:inline">
          {filteredSuppliers.length} vendors
        </span>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#86868b]">Loading suppliers...</p>
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-black/8 shadow-sm">
          <Truck className="w-12 h-12 text-[#86868b] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1d1d1f] mb-1">No Suppliers Found</h3>
          <p className="text-xs text-[#86868b] mb-6">
            Register your wholesale vendors to supply products into catalog.
          </p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold shadow-md shadow-black/15 transition"
          >
            Add Supplier
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-white rounded-2xl p-5 border border-black/8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  {/* Supplier Logo or Icon */}
                  {sup.imageUrl ? (
                    <img
                      src={sup.imageUrl}
                      alt={sup.name}
                      className="w-12 h-12 rounded-xl object-cover border border-black/8 bg-[#f5f5f7]"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#af52de]">
                      <Truck className="w-5 h-5" />
                    </div>
                  )}

                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-black/5 text-[#86868b] border border-black/8">
                    ID #{sup.id}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#1d1d1f] tracking-tight mb-2 truncate">
                  {sup.name}
                </h3>

                <div className="space-y-2 text-xs text-[#1d1d1f]">
                  {sup.contactName && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#86868b] shrink-0" />
                      <span className="truncate">{sup.contactName}</span>
                    </div>
                  )}

                  {sup.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#86868b] shrink-0" />
                      <span className="truncate text-[#86868b]">{sup.email}</span>
                    </div>
                  )}

                  {sup.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#86868b] shrink-0" />
                      <span>{sup.phone}</span>
                    </div>
                  )}

                  {sup.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#86868b] shrink-0" />
                      <span className="truncate text-[#86868b]">{sup.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(sup)}
                  className="p-2 rounded-xl bg-[#f5f5f7] hover:bg-[#1d1d1f]/10 text-[#6e6e73] hover:text-[#1d1d1f] transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmation(sup)}
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
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 border border-black/8 shadow-[0_20px_60px_rgba(0,0,0,0.18)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/8">
              <h3 className="text-lg font-bold text-[#1d1d1f]">
                {editingSupplier ? 'Edit Supplier' : 'Register Supplier'}
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
              {/* Supplier Logo Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                  Vendor Logo / Image
                </label>
                <div className="flex items-center gap-3">
                  {imagePreview ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-black/10 shrink-0 shadow-xs">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-0.5 right-0.5 p-1 bg-black/70 rounded-full text-white hover:bg-red-600 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null}

                  <label className="flex-1 border-2 border-dashed border-black/10 hover:border-[#1d1d1f]/50 rounded-xl p-3 text-center cursor-pointer transition bg-[#f5f5f7] hover:bg-[#ebebee]">
                    <Upload className="w-4 h-4 text-[#86868b] mx-auto mb-1" />
                    <span className="text-[11px] font-semibold text-[#86868b]">
                      {selectedFile ? selectedFile.name : 'Upload logo to Cloudinary'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                  Supplier / Company Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Acme Tech Distribution"
                  className="w-full bg-[#f5f5f7] border border-black/10 rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] focus:outline-hidden focus:border-[#1d1d1f]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#f5f5f7] border border-black/10 rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] focus:outline-hidden focus:border-[#1d1d1f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rep@acme.com"
                    className="w-full bg-[#f5f5f7] border border-black/10 rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] focus:outline-hidden focus:border-[#1d1d1f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="012 345 678"
                    className="w-full bg-[#f5f5f7] border border-black/10 rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] focus:outline-hidden focus:border-[#1d1d1f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                  Warehouse / Physical Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, Postal Code"
                  rows={2}
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
                      <span>{editingSupplier ? 'Update' : 'Register'}</span>
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
            <h3 className="text-base font-bold text-[#1d1d1f] mb-1">Delete Supplier?</h3>
            <p className="text-xs text-[#86868b] mb-5">
              Are you sure you want to remove{' '}
              <strong className="text-[#1d1d1f]">"{deleteConfirmation.name}"</strong>?
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

export default Suppliers;
